package backend.rent_car_backend.repository;

import backend.rent_car_backend.model.Car;
import backend.rent_car_backend.model.Reservation;
import backend.rent_car_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUser(User user);

    List<Reservation> findByCar(Car car);
}
