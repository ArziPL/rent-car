package backend.rent_car_backend.service;

import backend.rent_car_backend.dto.MotorbikeRequest;
import backend.rent_car_backend.dto.MotorbikeResponse;
import backend.rent_car_backend.model.Motorbike;
import backend.rent_car_backend.repository.MotorbikeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MotorbikeService {

    private final MotorbikeRepository motorbikeRepository;

    public MotorbikeResponse create(MotorbikeRequest req) {
        Motorbike motorbike = Motorbike.builder()
                .brand(req.getBrand())
                .model(req.getModel())
                .year(req.getYear())
                .engineCc(req.getEngineCc())
                .pricePerDay(req.getPricePerDay())
                .available(true)
                .licenseCategory(req.getLicenseCategory())
                .motorbikeType(req.getMotorbikeType())
                .abs(req.isAbs())
                .build();
        return toResponse(motorbikeRepository.save(motorbike));
    }

    public MotorbikeResponse update(Long id, MotorbikeRequest req) {
        Motorbike motorbike = motorbikeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Motorbike not found with id: " + id));
        motorbike.setBrand(req.getBrand());
        motorbike.setModel(req.getModel());
        motorbike.setYear(req.getYear());
        motorbike.setEngineCc(req.getEngineCc());
        motorbike.setPricePerDay(req.getPricePerDay());
        motorbike.setLicenseCategory(req.getLicenseCategory());
        motorbike.setMotorbikeType(req.getMotorbikeType());
        motorbike.setAbs(req.isAbs());
        return toResponse(motorbikeRepository.save(motorbike));
    }

    public MotorbikeResponse findById(Long id) {
        return motorbikeRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Motorbike not found with id: " + id));
    }

    public List<MotorbikeResponse> findAll() {
        return motorbikeRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<MotorbikeResponse> findAllAvailable() {
        return motorbikeRepository.findByAvailable(true).stream().map(this::toResponse).toList();
    }

    private MotorbikeResponse toResponse(Motorbike motorbike) {
        return MotorbikeResponse.builder()
                .id(motorbike.getId())
                .brand(motorbike.getBrand())
                .model(motorbike.getModel())
                .year(motorbike.getYear())
                .engineCc(motorbike.getEngineCc())
                .pricePerDay(motorbike.getPricePerDay())
                .licenseCategory(motorbike.getLicenseCategory())
                .motorbikeType(motorbike.getMotorbikeType())
                .abs(motorbike.isAbs())
                .available(motorbike.isAvailable())
                .createdAt(motorbike.getCreatedAt())
                .build();
    }
}
