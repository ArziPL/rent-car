package backend.rent_car_backend.controller;

import backend.rent_car_backend.exception.GlobalExceptionHandler;
import backend.rent_car_backend.service.VehicleService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class VehicleAdminControllerTest {

    @Mock private VehicleService vehicleService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new VehicleAdminController(vehicleService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void deleteVehicle_existingId_returns204() throws Exception {
        doNothing().when(vehicleService).delete(1L);

        mockMvc.perform(delete("/api/admin/vehicles/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteVehicle_nonExistentId_returns404() throws Exception {
        doThrow(new EntityNotFoundException("Vehicle not found with id: 99"))
                .when(vehicleService).delete(99L);

        mockMvc.perform(delete("/api/admin/vehicles/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Vehicle not found with id: 99"));
    }
}
