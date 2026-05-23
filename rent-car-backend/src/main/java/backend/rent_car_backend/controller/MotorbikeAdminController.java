package backend.rent_car_backend.controller;

import backend.rent_car_backend.dto.MotorbikeRequest;
import backend.rent_car_backend.dto.MotorbikeResponse;
import backend.rent_car_backend.service.MotorbikeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/vehicles/motorbikes")
@RequiredArgsConstructor
public class MotorbikeAdminController {

    private final MotorbikeService motorbikeService;

    @PostMapping
    public ResponseEntity<MotorbikeResponse> createMotorbike(@Valid @RequestBody MotorbikeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(motorbikeService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MotorbikeResponse> updateMotorbike(@PathVariable Long id,
                                                              @Valid @RequestBody MotorbikeRequest request) {
        return ResponseEntity.ok(motorbikeService.update(id, request));
    }
}
