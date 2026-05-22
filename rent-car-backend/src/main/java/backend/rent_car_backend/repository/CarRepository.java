package backend.rent_car_backend.repository;

import backend.rent_car_backend.model.Car;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarRepository extends JpaRepository<Car, Long> {

    List<Car> findByAvailable(boolean available);
}
