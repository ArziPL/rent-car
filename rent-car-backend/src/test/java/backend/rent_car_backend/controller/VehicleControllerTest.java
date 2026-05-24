package backend.rent_car_backend.controller;

import backend.rent_car_backend.exception.GlobalExceptionHandler;
import backend.rent_car_backend.service.CarService;
import backend.rent_car_backend.service.MotorbikeService;
import backend.rent_car_backend.service.VehicleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class VehicleControllerTest {

    @Mock private VehicleService vehicleService;
    @Mock private CarService carService;
    @Mock private MotorbikeService motorbikeService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new VehicleController(vehicleService, carService, motorbikeService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getAllVehicles_noAuth_returns200() throws Exception {
        when(vehicleService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllCars_noAuth_returns200() throws Exception {
        when(carService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/vehicles/cars"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllMotorbikes_noAuth_returns200() throws Exception {
        when(motorbikeService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/vehicles/motorbikes"))
                .andExpect(status().isOk());
    }
}
