package backend.rent_car_backend.controller;

import backend.rent_car_backend.dto.CarRequest;
import backend.rent_car_backend.dto.CarResponse;
import backend.rent_car_backend.exception.GlobalExceptionHandler;
import backend.rent_car_backend.model.FuelType;
import backend.rent_car_backend.model.Transmission;
import backend.rent_car_backend.service.CarService;
import backend.rent_car_backend.service.MotorbikeService;
import backend.rent_car_backend.service.VehicleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CarControllerTest {

    @Mock private CarService carService;
    @Mock private MotorbikeService motorbikeService;
    @Mock private VehicleService vehicleService;

    private MockMvc adminMvc;
    private MockMvc vehicleMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        adminMvc = MockMvcBuilders
                .standaloneSetup(new CarAdminController(carService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        vehicleMvc = MockMvcBuilders
                .standaloneSetup(new VehicleController(vehicleService, carService, motorbikeService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private CarRequest validRequest() {
        return CarRequest.builder()
                .brand("Toyota").model("Corolla").year(2022)
                .engineCc(1800).pricePerDay(new BigDecimal("100.00"))
                .numSeats(5).transmission(Transmission.MANUAL).fuelType(FuelType.PETROL)
                .build();
    }

    private CarResponse carResponse() {
        return CarResponse.builder()
                .id(1L).brand("Toyota").model("Corolla").year(2022)
                .engineCc(1800).pricePerDay(new BigDecimal("100.00"))
                .numSeats(5).transmission(Transmission.MANUAL).fuelType(FuelType.PETROL)
                .available(true)
                .build();
    }

    @Test
    void createCar_validRequest_returns201() throws Exception {
        when(carService.create(any())).thenReturn(carResponse());

        adminMvc.perform(post("/api/admin/vehicles/cars")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.brand").value("Toyota"))
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void createCar_blankBrand_returns400() throws Exception {
        CarRequest invalid = validRequest();
        invalid.setBrand("");

        adminMvc.perform(post("/api/admin/vehicles/cars")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateCar_existingId_returns200() throws Exception {
        when(carService.update(eq(1L), any())).thenReturn(carResponse());

        adminMvc.perform(put("/api/admin/vehicles/cars/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brand").value("Toyota"));
    }

    @Test
    void updateCar_nonExistentId_returns404() throws Exception {
        when(carService.update(eq(99L), any()))
                .thenThrow(new EntityNotFoundException("Car not found with id: 99"));

        adminMvc.perform(put("/api/admin/vehicles/cars/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Car not found with id: 99"));
    }

    @Test
    void getAllCars_returns200WithList() throws Exception {
        when(carService.findAll()).thenReturn(List.of(carResponse()));

        vehicleMvc.perform(get("/api/vehicles/cars"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].brand").value("Toyota"));
    }

    @Test
    void getCarById_existing_returns200() throws Exception {
        when(carService.findById(1L)).thenReturn(carResponse());

        vehicleMvc.perform(get("/api/vehicles/cars/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void getCarById_nonExistent_returns404() throws Exception {
        when(carService.findById(99L))
                .thenThrow(new EntityNotFoundException("Car not found with id: 99"));

        vehicleMvc.perform(get("/api/vehicles/cars/99"))
                .andExpect(status().isNotFound());
    }
}
