package backend.rent_car_backend.repository;

import backend.rent_car_backend.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByAvailable(boolean available);
}
