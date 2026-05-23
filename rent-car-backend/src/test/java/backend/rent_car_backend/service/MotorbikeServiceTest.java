package backend.rent_car_backend.service;

import backend.rent_car_backend.dto.MotorbikeRequest;
import backend.rent_car_backend.dto.MotorbikeResponse;
import backend.rent_car_backend.model.LicenseCategory;
import backend.rent_car_backend.model.Motorbike;
import backend.rent_car_backend.model.MotorbikeType;
import backend.rent_car_backend.repository.MotorbikeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MotorbikeServiceTest {

    @Mock
    private MotorbikeRepository motorbikeRepository;

    @InjectMocks
    private MotorbikeService motorbikeService;

    private MotorbikeRequest validRequest() {
        return MotorbikeRequest.builder()
                .brand("Honda")
                .model("CB500F")
                .year(2021)
                .engineCc(500)
                .pricePerDay(new BigDecimal("80.00"))
                .licenseCategory(LicenseCategory.A)
                .motorbikeType(MotorbikeType.NAKED)
                .abs(true)
                .build();
    }

    private Motorbike savedMotorbike(Long id) {
        return Motorbike.builder()
                .id(id)
                .brand("Honda")
                .model("CB500F")
                .year(2021)
                .engineCc(500)
                .pricePerDay(new BigDecimal("80.00"))
                .available(true)
                .licenseCategory(LicenseCategory.A)
                .motorbikeType(MotorbikeType.NAKED)
                .abs(true)
                .build();
    }

    @Test
    void create_validRequest_returnsMotorbikeResponse() {
        when(motorbikeRepository.save(any(Motorbike.class))).thenAnswer(inv -> {
            Motorbike m = inv.getArgument(0);
            return Motorbike.builder()
                    .id(1L).brand(m.getBrand()).model(m.getModel()).year(m.getYear())
                    .engineCc(m.getEngineCc()).pricePerDay(m.getPricePerDay()).available(m.isAvailable())
                    .licenseCategory(m.getLicenseCategory()).motorbikeType(m.getMotorbikeType()).abs(m.isAbs())
                    .build();
        });

        MotorbikeResponse response = motorbikeService.create(validRequest());

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getBrand()).isEqualTo("Honda");
        assertThat(response.isAvailable()).isTrue();
    }

    @Test
    void update_existingId_updatesFields() {
        Motorbike existing = savedMotorbike(1L);
        when(motorbikeRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(motorbikeRepository.save(any(Motorbike.class))).thenAnswer(inv -> inv.getArgument(0));

        MotorbikeRequest updated = validRequest();
        updated.setBrand("Yamaha");
        MotorbikeResponse response = motorbikeService.update(1L, updated);

        assertThat(response.getBrand()).isEqualTo("Yamaha");
    }

    @Test
    void update_nonExistentId_throwsEntityNotFoundException() {
        when(motorbikeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> motorbikeService.update(99L, validRequest()))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void findById_existingId_returnsResponse() {
        when(motorbikeRepository.findById(1L)).thenReturn(Optional.of(savedMotorbike(1L)));

        MotorbikeResponse response = motorbikeService.findById(1L);

        assertThat(response.getId()).isEqualTo(1L);
    }

    @Test
    void findById_nonExistentId_throwsEntityNotFoundException() {
        when(motorbikeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> motorbikeService.findById(99L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void findAll_returnsMappedList() {
        when(motorbikeRepository.findAll()).thenReturn(List.of(savedMotorbike(1L), savedMotorbike(2L)));

        List<MotorbikeResponse> result = motorbikeService.findAll();

        assertThat(result).hasSize(2);
    }

    @Test
    void findAllAvailable_returnsOnlyAvailable() {
        when(motorbikeRepository.findByAvailable(true)).thenReturn(List.of(savedMotorbike(1L)));

        List<MotorbikeResponse> result = motorbikeService.findAllAvailable();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isAvailable()).isTrue();
    }
}
