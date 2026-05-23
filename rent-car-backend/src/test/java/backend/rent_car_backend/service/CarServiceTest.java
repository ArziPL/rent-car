package backend.rent_car_backend.service;

import backend.rent_car_backend.dto.CarRequest;
import backend.rent_car_backend.dto.CarResponse;
import backend.rent_car_backend.model.Car;
import backend.rent_car_backend.model.FuelType;
import backend.rent_car_backend.model.Transmission;
import backend.rent_car_backend.repository.CarRepository;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CarServiceTest {

    @Mock
    private CarRepository carRepository;

    @InjectMocks
    private CarService carService;

    private CarRequest validRequest() {
        return CarRequest.builder()
                .brand("Toyota")
                .model("Corolla")
                .year(2022)
                .engineCc(1800)
                .pricePerDay(new BigDecimal("100.00"))
                .numSeats(5)
                .transmission(Transmission.MANUAL)
                .fuelType(FuelType.PETROL)
                .build();
    }

    private Car savedCar(Long id) {
        return Car.builder()
                .id(id)
                .brand("Toyota")
                .model("Corolla")
                .year(2022)
                .engineCc(1800)
                .pricePerDay(new BigDecimal("100.00"))
                .available(true)
                .numSeats(5)
                .transmission(Transmission.MANUAL)
                .fuelType(FuelType.PETROL)
                .build();
    }

    @Test
    void create_validRequest_returnsCarResponse() {
        when(carRepository.save(any(Car.class))).thenAnswer(inv -> {
            Car c = inv.getArgument(0);
            return Car.builder()
                    .id(1L).brand(c.getBrand()).model(c.getModel()).year(c.getYear())
                    .engineCc(c.getEngineCc()).pricePerDay(c.getPricePerDay()).available(c.isAvailable())
                    .numSeats(c.getNumSeats()).transmission(c.getTransmission()).fuelType(c.getFuelType())
                    .build();
        });

        CarResponse response = carService.create(validRequest());

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getBrand()).isEqualTo("Toyota");
        assertThat(response.isAvailable()).isTrue();
    }

    @Test
    void update_existingId_updatesFields() {
        Car existing = savedCar(1L);
        when(carRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(carRepository.save(any(Car.class))).thenAnswer(inv -> inv.getArgument(0));

        CarRequest updated = validRequest();
        updated.setBrand("Honda");
        CarResponse response = carService.update(1L, updated);

        assertThat(response.getBrand()).isEqualTo("Honda");
    }

    @Test
    void update_nonExistentId_throwsEntityNotFoundException() {
        when(carRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> carService.update(99L, validRequest()))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void findById_existingId_returnsResponse() {
        when(carRepository.findById(1L)).thenReturn(Optional.of(savedCar(1L)));

        CarResponse response = carService.findById(1L);

        assertThat(response.getId()).isEqualTo(1L);
    }

    @Test
    void findById_nonExistentId_throwsEntityNotFoundException() {
        when(carRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> carService.findById(99L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void findAll_returnsMappedList() {
        when(carRepository.findAll()).thenReturn(List.of(savedCar(1L), savedCar(2L)));

        List<CarResponse> result = carService.findAll();

        assertThat(result).hasSize(2);
    }

    @Test
    void findAllAvailable_returnsOnlyAvailable() {
        when(carRepository.findByAvailable(true)).thenReturn(List.of(savedCar(1L)));

        List<CarResponse> result = carService.findAllAvailable();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isAvailable()).isTrue();
    }
}
