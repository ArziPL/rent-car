package backend.rent_car_backend.service;

import backend.rent_car_backend.dto.AdminReservationResponse;
import backend.rent_car_backend.dto.ReservationRequest;
import backend.rent_car_backend.dto.ReservationResponse;
import backend.rent_car_backend.model.Car;
import backend.rent_car_backend.model.Reservation;
import backend.rent_car_backend.model.ReservationStatus;
import backend.rent_car_backend.model.User;
import backend.rent_car_backend.model.Vehicle;
import backend.rent_car_backend.repository.ReservationRepository;
import backend.rent_car_backend.repository.UserRepository;
import backend.rent_car_backend.repository.VehicleRepository;
import backend.rent_car_backend.service.pricing.PricingStrategy;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final PricingStrategy pricingStrategy;

    public ReservationResponse create(ReservationRequest req, String email) {
        Vehicle vehicle = vehicleRepository.findByIdForUpdate(req.getVehicleId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + req.getVehicleId()));

        if (!vehicle.isAvailable()) {
            throw new IllegalArgumentException("Vehicle is not available for reservation");
        }

        if (!req.getEndDate().isAfter(req.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        if (reservationRepository.existsOverlapping(
                req.getVehicleId(), req.getStartDate(), req.getEndDate(), ReservationStatus.CONFIRMED)) {
            throw new IllegalArgumentException("Vehicle already has a confirmed reservation for the selected dates");
        }

        BigDecimal totalPrice = pricingStrategy.calculate(req.getStartDate(), req.getEndDate(), vehicle.getPricePerDay());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));

        Reservation reservation = Reservation.builder()
                .user(user)
                .vehicle(vehicle)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .totalPrice(totalPrice)
                .build();

        return toResponse(reservationRepository.save(reservation));
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> findByCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
        return reservationRepository.findByUserId(user.getId()).stream().map(this::toResponse).toList();
    }

    public void cancel(Long id, String email) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found with id: " + id));

        if (!reservation.getUser().getEmail().equals(email)) {
            throw new IllegalArgumentException("Not your reservation");
        }

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING reservations can be cancelled");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }

    public ReservationResponse updateStatus(Long id, ReservationStatus newStatus) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found with id: " + id));

        ReservationStatus current = reservation.getStatus();
        boolean valid = switch (current) {
            case PENDING   -> newStatus == ReservationStatus.CONFIRMED || newStatus == ReservationStatus.CANCELLED;
            case CONFIRMED -> newStatus == ReservationStatus.COMPLETED || newStatus == ReservationStatus.CANCELLED;
            case COMPLETED -> newStatus == ReservationStatus.CANCELLED;
            case CANCELLED -> false;
        };
        if (!valid) {
            throw new IllegalArgumentException(
                    "Invalid status transition: " + current + " → " + newStatus);
        }

        if (newStatus == ReservationStatus.CONFIRMED) {
            // Acquire a pessimistic write lock on the vehicle row before the overlap check,
            // so two concurrent admin CONFIRM calls on overlapping reservations cannot both pass.
            vehicleRepository.findByIdForUpdate(reservation.getVehicle().getId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Vehicle not found with id: " + reservation.getVehicle().getId()));

            if (reservationRepository.existsOverlapping(
                    reservation.getVehicle().getId(),
                    reservation.getStartDate(),
                    reservation.getEndDate(),
                    ReservationStatus.CONFIRMED)) {
                throw new IllegalArgumentException(
                        "Vehicle already has a confirmed reservation for the selected dates");
            }
        }

        reservation.setStatus(newStatus);
        return toResponse(reservationRepository.save(reservation));
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> findAll() {
        return reservationRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AdminReservationResponse> findAllAsAdmin() {
        return reservationRepository.findAll().stream().map(this::toAdminResponse).toList();
    }

    private ReservationResponse toResponse(Reservation r) {
        return ReservationResponse.builder()
                .id(r.getId())
                .vehicleId(r.getVehicle().getId())
                .vehicleBrand(r.getVehicle().getBrand())
                .vehicleModel(r.getVehicle().getModel())
                .vehicleType(r.getVehicle() instanceof Car ? "CAR" : "MOTORBIKE")
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .status(r.getStatus())
                .totalPrice(r.getTotalPrice())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private AdminReservationResponse toAdminResponse(Reservation r) {
        return AdminReservationResponse.builder()
                .id(r.getId())
                .vehicleId(r.getVehicle().getId())
                .vehicleBrand(r.getVehicle().getBrand())
                .vehicleModel(r.getVehicle().getModel())
                .vehicleType(r.getVehicle() instanceof Car ? "CAR" : "MOTORBIKE")
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .status(r.getStatus())
                .totalPrice(r.getTotalPrice())
                .createdAt(r.getCreatedAt())
                .userId(r.getUser().getId())
                .userEmail(r.getUser().getEmail())
                .build();
    }
}
