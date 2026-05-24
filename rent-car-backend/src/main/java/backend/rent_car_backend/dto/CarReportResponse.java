package backend.rent_car_backend.dto;

import backend.rent_car_backend.model.FuelType;
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
public class CarReportResponse {

    // --- Car spec fields ---
    private Long id;
    private String brand;
    private String model;
    private int year;
    private int engineCc;
    private BigDecimal pricePerDay;
    private boolean available;
    private int numSeats;
    private Transmission transmission;
    private FuelType fuelType;
    private LocalDateTime createdAt;

    // --- Report stats (CANCELLED reservations excluded) ---
    private int reservationCount;
    private BigDecimal totalRevenue;
    private long weekdayDays;
    private long weekendDays;
}
