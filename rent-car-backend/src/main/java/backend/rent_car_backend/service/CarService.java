package backend.rent_car_backend.service;

import backend.rent_car_backend.dto.CarRequest;
import backend.rent_car_backend.dto.CarResponse;
import backend.rent_car_backend.model.Car;
import backend.rent_car_backend.repository.CarRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CarService {

    private final CarRepository carRepository;

    public CarResponse create(CarRequest req) {
        Car car = Car.builder()
                .brand(req.getBrand())
                .model(req.getModel())
                .year(req.getYear())
                .engineCc(req.getEngineCc())
                .pricePerDay(req.getPricePerDay())
                .available(true)
                .numSeats(req.getNumSeats())
                .transmission(req.getTransmission())
                .fuelType(req.getFuelType())
                .build();
        return toResponse(carRepository.save(car));
    }

    public CarResponse update(Long id, CarRequest req) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Car not found with id: " + id));
        car.setBrand(req.getBrand());
        car.setModel(req.getModel());
        car.setYear(req.getYear());
        car.setEngineCc(req.getEngineCc());
        car.setPricePerDay(req.getPricePerDay());
        car.setNumSeats(req.getNumSeats());
        car.setTransmission(req.getTransmission());
        car.setFuelType(req.getFuelType());
        if (req.getAvailable() != null) car.setAvailable(req.getAvailable());
        return toResponse(carRepository.save(car));
    }

    @Transactional(readOnly = true)
    public CarResponse findById(Long id) {
        return carRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Car not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<CarResponse> findAll() {
        return carRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CarResponse> findAllAvailable() {
        return carRepository.findByAvailable(true).stream().map(this::toResponse).toList();
    }

    private CarResponse toResponse(Car car) {
        return CarResponse.builder()
                .type("CAR")
                .id(car.getId())
                .brand(car.getBrand())
                .model(car.getModel())
                .year(car.getYear())
                .engineCc(car.getEngineCc())
                .pricePerDay(car.getPricePerDay())
                .numSeats(car.getNumSeats())
                .transmission(car.getTransmission())
                .fuelType(car.getFuelType())
                .available(car.isAvailable())
                .createdAt(car.getCreatedAt())
                .build();
    }
}
