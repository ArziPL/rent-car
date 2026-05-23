package backend.rent_car_backend.repository;

import backend.rent_car_backend.model.Reservation;
import backend.rent_car_backend.model.ReservationStatus;
import backend.rent_car_backend.model.User;
import backend.rent_car_backend.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUser(User user);

    List<Reservation> findByVehicle(Vehicle vehicle);

    List<Reservation> findByUserId(Long userId);

    @Query("SELECT COUNT(r) > 0 FROM Reservation r WHERE r.vehicle.id = :vehicleId " +
           "AND r.status = :status AND r.startDate < :endDate AND r.endDate > :startDate")
    boolean existsOverlapping(@Param("vehicleId") Long vehicleId,
                              @Param("startDate") LocalDate startDate,
                              @Param("endDate") LocalDate endDate,
                              @Param("status") ReservationStatus status);
}
