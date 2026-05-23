package backend.rent_car_backend.controller;

import backend.rent_car_backend.dto.CarResponse;
import backend.rent_car_backend.dto.MotorbikeResponse;
import backend.rent_car_backend.dto.VehicleResponse;
import backend.rent_car_backend.service.CarService;
import backend.rent_car_backend.service.MotorbikeService;
import backend.rent_car_backend.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;
    private final CarService carService;
    private final MotorbikeService motorbikeService;

    @GetMapping
    public ResponseEntity<List<VehicleResponse>> getAllVehicles(
            @RequestParam(required = false) Boolean available) {
        List<VehicleResponse> vehicles = Boolean.TRUE.equals(available)
                ? vehicleService.findAllAvailable()
                : vehicleService.findAll();
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/cars")
    public ResponseEntity<List<CarResponse>> getAllCars() {
        return ResponseEntity.ok(carService.findAll());
    }

    @GetMapping("/cars/{id}")
    public ResponseEntity<CarResponse> getCarById(@PathVariable Long id) {
        return ResponseEntity.ok(carService.findById(id));
    }

    @GetMapping("/motorbikes")
    public ResponseEntity<List<MotorbikeResponse>> getAllMotorbikes() {
        return ResponseEntity.ok(motorbikeService.findAll());
    }

    @GetMapping("/motorbikes/{id}")
    public ResponseEntity<MotorbikeResponse> getMotorbikeById(@PathVariable Long id) {
        return ResponseEntity.ok(motorbikeService.findById(id));
    }
}
