package backend.rent_car_backend.dto;

import backend.rent_car_backend.model.FuelType;
import backend.rent_car_backend.model.LicenseCategory;
import backend.rent_car_backend.model.MotorbikeType;
import backend.rent_car_backend.model.Transmission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleReportResponse {

    // --- Common Vehicle fields ---
    private Long id;
    private String brand;
    private String model;
    private int year;
    private int engineCc;
    private BigDecimal pricePerDay;
    private boolean available;
    private LocalDateTime createdAt;
    private String type;  // "CAR" | "MOTORBIKE"

    // --- Car-specific (null for motorbikes) ---
    private Integer numSeats;
    private Transmission transmission;
    private FuelType fuelType;

    // --- Motorbike-specific (null for cars) ---
    private LicenseCategory licenseCategory;
    private MotorbikeType motorbikeType;
    private Boolean abs;

    // --- Report stats (CANCELLED reservations excluded) ---
    private int reservationCount;
    private BigDecimal totalRevenue;
    private long weekdayDays;
    private long weekendDays;
}
