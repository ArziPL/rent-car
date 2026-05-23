package backend.rent_car_backend.service;

import backend.rent_car_backend.dto.VehicleResponse;
import backend.rent_car_backend.model.Car;
import backend.rent_car_backend.model.FuelType;
import backend.rent_car_backend.model.Motorbike;
import backend.rent_car_backend.model.LicenseCategory;
import backend.rent_car_backend.model.MotorbikeType;
import backend.rent_car_backend.model.Transmission;
import backend.rent_car_backend.repository.VehicleRepository;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private VehicleService vehicleService;

    private Car buildCar(Long id) {
        return Car.builder()
                .id(id).brand("Toyota").model("Corolla").year(2022)
                .engineCc(1800).pricePerDay(new BigDecimal("100.00")).available(true)
                .numSeats(5).transmission(Transmission.MANUAL).fuelType(FuelType.PETROL)
                .build();
    }

    private Motorbike buildMotorbike(Long id) {
        return Motorbike.builder()
                .id(id).brand("Honda").model("CB500F").year(2021)
                .engineCc(500).pricePerDay(new BigDecimal("80.00")).available(true)
                .licenseCategory(LicenseCategory.A).motorbikeType(MotorbikeType.NAKED).abs(true)
                .build();
    }

    @Test
    void delete_existingId_deletesVehicle() {
        Car car = buildCar(1L);
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(car));

        vehicleService.delete(1L);

        verify(vehicleRepository).delete(car);
    }

    @Test
    void delete_nonExistentId_throwsEntityNotFoundException() {
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.delete(99L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void findAll_mapsCarTypeCorrectly() {
        when(vehicleRepository.findAll()).thenReturn(List.of(buildCar(1L)));

        List<VehicleResponse> result = vehicleService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getType()).isEqualTo("CAR");
    }

    @Test
    void findAll_mapsMotorbikeTypeCorrectly() {
        when(vehicleRepository.findAll()).thenReturn(List.of(buildMotorbike(1L)));

        List<VehicleResponse> result = vehicleService.findAll();

        assertThat(result.get(0).getType()).isEqualTo("MOTORBIKE");
    }

    @Test
    void findAllAvailable_returnsOnlyAvailable() {
        when(vehicleRepository.findByAvailable(true)).thenReturn(List.of(buildCar(1L)));

        List<VehicleResponse> result = vehicleService.findAllAvailable();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isAvailable()).isTrue();
    }
}
