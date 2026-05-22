package backend.rent_car_backend.repository;

import backend.rent_car_backend.model.Motorbike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MotorbikeRepository extends JpaRepository<Motorbike, Long> {

    List<Motorbike> findByAvailable(boolean available);
}