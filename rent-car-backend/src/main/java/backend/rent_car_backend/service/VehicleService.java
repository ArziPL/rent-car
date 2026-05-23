package backend.rent_car_backend.service;

import backend.rent_car_backend.dto.VehicleResponse;
import backend.rent_car_backend.model.Car;
import backend.rent_car_backend.model.Vehicle;
import backend.rent_car_backend.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public void delete(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + id));
        vehicleRepository.delete(vehicle);
    }

    public List<VehicleResponse> findAll() {
        return vehicleRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<VehicleResponse> findAllAvailable() {
        return vehicleRepository.findByAvailable(true).stream().map(this::toResponse).toList();
    }

    private VehicleResponse toResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .brand(vehicle.getBrand())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .pricePerDay(vehicle.getPricePerDay())
                .available(vehicle.isAvailable())
                .type(vehicle instanceof Car ? "CAR" : "MOTORBIKE")
                .build();
    }
}
