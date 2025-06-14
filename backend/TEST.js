import Ride from "../models/ride.model.js"
import Driver from "../models/driver.model.js"
import User from "../models/user.model.js"
import Payment from "../models/payment.model.js"
import { createError } from "../utils/error.utils.js"
import { calculateRidePrice } from "../utils/pricing.utils.js"
import { getDistance } from "../utils/maps.utils.js"
import { findNearbyDrivers } from "../utils/driver.utils.js"
import { createNotification } from "../utils/notification.utils.js"
import { processPayment } from "../utils/payment.utils.js"
import { generateRideReceipt } from "../utils/receipt.utils.js"

// Request a new ride
export const requestRide = async (req, res, next) => {
  try {
    const { pickup, destination, scheduledTime, vehicleType, passengers, paymentMethod, notes } = req.body

    // Calculate distance and duration
    const { distance, duration } = await getDistance(pickup.location.coordinates, destination.location.coordinates)

    // Calculate price
    const price = calculateRidePrice(distance, duration, vehicleType)

    // Create new ride
    const ride = new Ride({
      passenger: req.user.id,
      pickup,
      destination,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      vehicleType: vehicleType || "standard",
      passengers: passengers || 1,
      price: {
        base: price.base,
        distance: price.distance,
        time: price.time,
        total: price.total,
      },
      distance,
      duration,
      payment: {
        method: paymentMethod || "card",
      },
      notes,
      status: scheduledTime ? "scheduled" : "requested",
    })

    await ride.save()

    // If ride is scheduled, don't search for drivers yet
    if (scheduledTime) {
      res.status(201).json({
        success: true,
        message: "Ride scheduled successfully",
        ride,
      })
      return
    }

    // Find nearby drivers
    const nearbyDrivers = await findNearbyDrivers(pickup.location.coordinates, vehicleType)

    if (nearbyDrivers.length === 0) {
      // No drivers available
      ride.status = "noDriver"
      await ride.save()

      // Notify passenger
      await createNotification({
        recipient: req.user.id,
        title: "No drivers available",
        message: "No drivers are currently available in your area. Please try again later.",
        type: "ride_cancelled",
        reference: ride._id,
        referenceModel: "Ride",
      })

      return res.status(200).json({
        success: false,
        message: "No drivers available",
        ride,
      })
    }

    // Update ride status
    ride.status = "searching"
    await ride.save()

    // Notify nearby drivers
    for (const driver of nearbyDrivers) {
      await createNotification({
        recipient: driver.user,
        title: "New ride request",
        message: `New ride request from ${pickup.address} to ${destination.address}`,
        type: "ride_request",
        reference: ride._id,
        referenceModel: "Ride",
        data: {
          rideId: ride._id,
          pickup: ride.pickup,
          destination: ride.destination,
          price: ride.price.total,
        },
      })
    }

    res.status(201).json({
      success: true,
      message: "Ride requested successfully",
      ride,
    })
  } catch (error) {
    next(error)
  }
}

// Accept a ride (driver)
export const acceptRide = async (req, res, next) => {
  try {
    const { rideId } = req.params

    // Find ride
    const ride = await Ride.findById(rideId)
    if (!ride) {
      return next(createError(404, "Ride not found"))
    }

    // Check if ride is still available
    if (ride.status !== "searching") {
      return next(createError(400, "Ride is no longer available"))
    }

    // Find driver
    const driver = await Driver.findOne({ user: req.user.id })
    if (!driver) {
      return next(createError(404, "Driver not found"))
    }

    // Check if driver is available
    if (!driver.isAvailable) {
      return next(createError(400, "Driver is not available"))
    }

    // Update ride
    ride.driver = driver._id
    ride.status = "accepted"
    await ride.save()

    // Update driver status
    driver.isAvailable = false
    await driver.save()

    // Notify passenger
    await createNotification({
      recipient: ride.passenger,
      title: "Ride accepted",
      message: "Your ride has been accepted by a driver",
      type: "ride_accepted",
      reference: ride._id,
      referenceModel: "Ride",
      data: {
        rideId: ride._id,
        driverId: driver._id,
        driverName: req.user.firstName + " " + req.user.lastName,
        driverPhone: req.user.phone,
        vehicleInfo: driver.vehicle,
      },
    })

    res.status(200).json({
      success: true,
      message: "Ride accepted successfully",
      ride,
    })
  } catch (error) {
    next(error)
  }
}

// Driver arrived at pickup
export const arrivedAtPickup = async (req, res, next) => {
  try {
    const { rideId } = req.params

    // Find ride
    const ride = await Ride.findById(rideId)
    if (!ride) {
      return next(createError(404, "Ride not found"))
    }

    // Check if driver is assigned to this ride
    const driver = await Driver.findOne({ user: req.user.id })
    if (!driver || !ride.driver.equals(driver._id)) {
      return next(createError(403, "You are not authorized to update this ride"))
    }

    // Check if ride is in the correct status
    if (ride.status !== "accepted") {
      return next(createError(400, "Ride is not in the correct status"))
    }

    // Update ride
    ride.status = "arrived"
    await ride.save()

    // Notify passenger
    await createNotification({
      recipient: ride.passenger,
      title: "Driver arrived",
      message: "Your driver has arrived at the pickup location",
      type: "ride_arrived",
      reference: ride._id,
      referenceModel: "Ride",
    })

    res.status(200).json({
      success: true,
      message: "Arrived at pickup successfully",
      ride,
    })
  } catch (error) {
    next(error)
  }
}

// Start ride
export const startRide = async (req, res, next) => {
  try {
    const { rideId } = req.params

    // Find ride
    const ride = await Ride.findById(rideId)
    if (!ride) {
      return next(createError(404, "Ride not found"))
    }

    // Check if driver is assigned to this ride
    const driver = await Driver.findOne({ user: req.user.id })
    if (!driver || !ride.driver.equals(driver._id)) {
      return next(createError(403, "You are not authorized to update this ride"))
    }

    // Check if ride is in the correct status
    if (ride.status !== "arrived") {
      return next(createError(400, "Ride is not in the correct status"))
    }

    // Update ride
    ride.status = "inProgress"
    ride.pickupTime = new Date()
    await ride.save()

    // Notify passenger
    await createNotification({
      recipient: ride.passenger,
      title: "Ride started",
      message: "Your ride has started",
      type: "ride_started",
      reference: ride._id,
      referenceModel: "Ride",
    })

    res.status(200).json({
      success: true,
      message: "Ride started successfully",
      ride,
    })
  } catch (error) {
    next(error)
  }
}

// Complete ride
export const completeRide = async (req, res, next) => {
  try {
    const { rideId } = req.params

    // Find ride
    const ride = await Ride.findById(rideId).populate("passenger")
    if (!ride) {
      return next(createError(404, "Ride not found"))
    }

    // Check if driver is assigned to this ride
    const driver = await Driver.findOne({ user: req.user.id })
    if (!driver || !ride.driver.equals(driver._id)) {
      return next(createError(403, "You are not authorized to update this ride"))
    }

    // Check if ride is in the correct status
    if (ride.status !== "inProgress") {
      return next(createError(400, "Ride is not in the correct status"))
    }

    // Update ride
    ride.status = "completed"
    ride.dropoffTime = new Date()
    await ride.save()

    // Process payment
    if (ride.payment.method !== "cash") {
      const paymentResult = await processPayment({
        amount: ride.price.total,
        currency: "EUR",
        user: ride.passenger,
        description: `Ride from ${ride.pickup.address} to ${ride.destination.address}`,
        paymentMethod: ride.payment.method,
      })

      ride.payment.status = paymentResult.status
      ride.payment.transactionId = paymentResult.transactionId
      await ride.save()

      // Create payment record
      const payment = new Payment({
        user: ride.passenger,
        type: "ride",
        amount: ride.price.total,
        status: paymentResult.status,
        method: ride.payment.method,
        transactionId: paymentResult.transactionId,
        reference: ride._id,
        referenceModel: "Ride",
      })
      await payment.save()

      // Generate receipt
      const receipt = await generateRideReceipt(ride)
      payment.receipt = {
        url: receipt,
        generatedAt: new Date(),
      }
      await payment.save()
    }

    // Update driver stats
    driver.completedRides += 1
    driver.isAvailable = true
    driver.balance += ride.price.total * 0.8 // Driver gets 80% of the fare
    await driver.save()

    // Notify passenger
    await createNotification({
      recipient: ride.passenger,
      title: "Ride completed",
      message: "Your ride has been completed",
      type: "ride_completed",
      reference: ride._id,
      referenceModel: "Ride",
    })

    res.status(200).json({
      success: true,
      message: "Ride completed successfully",
      ride,
    })
  } catch (error) {
    next(error)
  }
}

// Cancel ride
export const cancelRide = async (req, res, next) => {
  try {
    const { rideId } = req.params
    const { reason } = req.body

    // Find ride
    const ride = await Ride.findById(rideId)
    if (!ride) {
      return next(createError(404, "Ride not found"))
    }

    // Check if user is authorized to cancel
    const isPassenger = ride.passenger.equals(req.user.id)
    const driver = await Driver.findOne({ user: req.user.id })
    const isDriver = driver && ride.driver && ride.driver.equals(driver._id)

    if (!isPassenger && !isDriver) {
      return next(createError(403, "You are not authorized to cancel this ride"))
    }

    // Check if ride can be cancelled
    if (["completed", "cancelled", "noDriver"].includes(ride.status)) {
      return next(createError(400, "Ride cannot be cancelled"))
    }

    // Update ride
    ride.status = "cancelled"
    ride.cancelledBy = isPassenger ? "passenger" : "driver"
    ride.cancellationReason = reason || "No reason provided"
    await ride.save()

    // If driver cancelled, make them available again
    if (isDriver) {
      driver.isAvailable = true
      await driver.save()

      // Notify passenger
      await createNotification({
        recipient: ride.passenger,
        title: "Ride cancelled",
        message: "Your ride has been cancelled by the driver",
        type: "ride_cancelled",
        reference: ride._id,
        referenceModel: "Ride",
      })
    }

    // If passenger cancelled and driver was assigned, notify driver
    if (isPassenger && ride.driver) {
      // Update driver status
      const rideDriver = await Driver.findById(ride.driver)
      if (rideDriver) {
        rideDriver.isAvailable = true
        await rideDriver.save()
      }

      // Notify driver
      await createNotification({
        recipient: rideDriver.user,
        title: "Ride cancelled",
        message: "A ride has been cancelled by the passenger",
        type: "ride_cancelled",
        reference: ride._id,
        referenceModel: "Ride",
      })
    }

    res.status(200).json({
      success: true,
      message: "Ride cancelled successfully",
      ride,
    })
  } catch (error) {
    next(error)
  }
}

// Get ride by ID
export const getRideById = async (req, res, next) => {
  try {
    const { rideId } = req.params

    // Find ride
    const ride = await Ride.findById(rideId)
      .populate("passenger", "firstName lastName phone profilePicture")
      .populate({
        path: "driver",
        populate: {
          path: "user",
          select: "firstName lastName phone profilePicture",
        },
      })

    if (!ride) {
      return next(createError(404, "Ride not found"))
    }

    // Check if user is authorized to view
    const isPassenger = ride.passenger._id.equals(req.user.id)
    const driver = await Driver.findOne({ user: req.user.id })
    const isDriver = driver && ride.driver && ride.driver._id.equals(driver._id)
    const isAdmin = req.user.role === "admin"

    if (!isPassenger && !isDriver && !isAdmin) {
      return next(createError(403, "You are not authorized to view this ride"))
    }

    res.status(200).json({
      success: true,
      ride,
    })
  } catch (error) {
    next(error)
  }
}

// Get user rides
export const getUserRides = async (req, res, next) => {
  try {
    const { status, limit = 10, page = 1 } = req.query
    const skip = (page - 1) * limit

    // Build query
    const query = { passenger: req.user.id }
    if (status) {
      query.status = status
    }

    // Find rides
    const rides = await Ride.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))
      .populate("driver", "vehicle")
      .populate({
        path: "driver",
        populate: {
          path: "user",
          select: "firstName lastName profilePicture",
        },
      })

    // Count total
    const total = await Ride.countDocuments(query)

    res.status(200).json({
      success: true,
      rides,
      pagination: {
        total,
        page: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        limit: Number.parseInt(limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get driver rides
export const getDriverRides = async (req, res, next) => {
  try {
    const { status, limit = 10, page = 1 } = req.query
    const skip = (page - 1) * limit

    // Find driver
    const driver = await Driver.findOne({ user: req.user.id })
    if (!driver) {
      return next(createError(404, "Driver not found"))
    }

    // Build query
    const query = { driver: driver._id }
    if (status) {
      query.status = status
    }

    // Find rides
    const rides = await Ride.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))
      .populate("passenger", "firstName lastName profilePicture")

    // Count total
    const total = await Ride.countDocuments(query)

    res.status(200).json({
      success: true,
      rides,
      pagination: {
        total,
        page: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        limit: Number.parseInt(limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

// Rate ride
export const rateRide = async (req, res, next) => {
  try {
    const { rideId } = req.params
    const { rating, comment } = req.body

    // Find ride
    const ride = await Ride.findById(rideId)
    if (!ride) {
      return next(createError(404, "Ride not found"))
    }

    // Check if ride is completed
    if (ride.status !== "completed") {
      return next(createError(400, "Ride is not completed"))
    }

    // Check if user is passenger or driver
    const isPassenger = ride.passenger.equals(req.user.id)
    const driver = await Driver.findOne({ user: req.user.id })
    const isDriver = driver && ride.driver.equals(driver._id)

    if (!isPassenger && !isDriver) {
      return next(createError(403, "You are not authorized to rate this ride"))
    }

    // Update ride rating
    if (isPassenger) {
      // Passenger rating driver
      ride.rating.passenger = {
        value: rating,
        comment,
        createdAt: new Date(),
      }

      // Update driver rating
      const rideDriver = await Driver.findById(ride.driver).populate("user")
      if (rideDriver) {
        const user = await User.findById(rideDriver.user)
        const currentRating = user.rating || 0
        const currentCount = user.ratingCount || 0
        const newCount = currentCount + 1
        const newRating = (currentRating * currentCount + rating) / newCount

        user.rating = newRating
        user.ratingCount = newCount
        await user.save()
      }
    } else {
      // Driver rating passenger
      ride.rating.driver = {
        value: rating,
        comment,
        createdAt: new Date(),
      }

      // Update passenger rating
      const user = await User.findById(ride.passenger)
      const currentRating = user.rating || 0
      const currentCount = user.ratingCount || 0
      const newCount = currentCount + 1
      const newRating = (currentRating * currentCount + rating) / newCount

      user.rating = newRating
      user.ratingCount = newCount
      await user.save()
    }

    await ride.save()

    res.status(200).json({
      success: true,
      message: "Ride rated successfully",
      ride,
    })
  } catch (error) {
    next(error)
  }
}
