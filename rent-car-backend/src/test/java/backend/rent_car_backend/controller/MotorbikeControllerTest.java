package backend.rent_car_backend.controller;

import backend.rent_car_backend.dto.MotorbikeRequest;
import backend.rent_car_backend.dto.MotorbikeResponse;
import backend.rent_car_backend.exception.GlobalExceptionHandler;
import backend.rent_car_backend.model.LicenseCategory;
import backend.rent_car_backend.model.MotorbikeType;
import backend.rent_car_backend.service.MotorbikeService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MotorbikeControllerTest {

    @Mock private MotorbikeService motorbikeService;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new MotorbikeAdminController(motorbikeService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private MotorbikeRequest validRequest() {
        return MotorbikeRequest.builder()
                .brand("Honda").model("CB500F").year(2021)
                .engineCc(500).pricePerDay(new BigDecimal("80.00"))
                .licenseCategory(LicenseCategory.A).motorbikeType(MotorbikeType.NAKED).abs(true)
                .build();
    }

    private MotorbikeResponse motorbikeResponse() {
        return MotorbikeResponse.builder()
                .id(1L).brand("Honda").model("CB500F").year(2021)
                .engineCc(500).pricePerDay(new BigDecimal("80.00"))
                .licenseCategory(LicenseCategory.A).motorbikeType(MotorbikeType.NAKED)
                .abs(true).available(true)
                .build();
    }

    @Test
    void createMotorbike_validRequest_returns201() throws Exception {
        when(motorbikeService.create(any())).thenReturn(motorbikeResponse());

        mockMvc.perform(post("/api/admin/vehicles/motorbikes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.brand").value("Honda"))
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void createMotorbike_blankBrand_returns400() throws Exception {
        MotorbikeRequest invalid = validRequest();
        invalid.setBrand("");

        mockMvc.perform(post("/api/admin/vehicles/motorbikes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateMotorbike_existingId_returns200() throws Exception {
        when(motorbikeService.update(eq(1L), any())).thenReturn(motorbikeResponse());

        mockMvc.perform(put("/api/admin/vehicles/motorbikes/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brand").value("Honda"));
    }

    @Test
    void updateMotorbike_nonExistentId_returns404() throws Exception {
        when(motorbikeService.update(eq(99L), any()))
                .thenThrow(new EntityNotFoundException("Motorbike not found with id: 99"));

        mockMvc.perform(put("/api/admin/vehicles/motorbikes/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Motorbike not found with id: 99"));
    }
}
