package backend.rent_car_backend.service;

import backend.rent_car_backend.dto.VehicleReportResponse;
import backend.rent_car_backend.model.Car;
import backend.rent_car_backend.model.Motorbike;
import backend.rent_car_backend.model.Reservation;
import backend.rent_car_backend.model.ReservationStatus;
import backend.rent_car_backend.model.Vehicle;
import backend.rent_car_backend.repository.ReservationRepository;
import backend.rent_car_backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ReportService {

    private final VehicleRepository vehicleRepository;
    private final ReservationRepository reservationRepository;

    public List<VehicleReportResponse> getVehicleReport() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        if (vehicles.isEmpty()) {
            return List.of();
        }

        // Single batch query for all non-cancelled reservations — avoids N+1
        List<Long> vehicleIds = vehicles.stream().map(Vehicle::getId).toList();
        Map<Long, List<Reservation>> reservationsByVehicleId =
                reservationRepository.findByVehicleIdInAndStatusNot(vehicleIds, ReservationStatus.CANCELLED)
                        .stream()
                        .collect(Collectors.groupingBy(r -> r.getVehicle().getId()));

        return vehicles.stream()
                .map(v -> toReportResponse(v, reservationsByVehicleId.getOrDefault(v.getId(), List.of())))
                .toList();
    }

    private VehicleReportResponse toReportResponse(Vehicle vehicle, List<Reservation> reservations) {

        long weekdayDays = 0;
        long weekendDays = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (Reservation r : reservations) {
            totalRevenue = totalRevenue.add(r.getTotalPrice());
            for (LocalDate d = r.getStartDate(); d.isBefore(r.getEndDate()); d = d.plusDays(1)) {
                DayOfWeek dow = d.getDayOfWeek();
                if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
                    weekendDays++;
                } else {
                    weekdayDays++;
                }
            }
        }

        VehicleReportResponse.VehicleReportResponseBuilder builder = VehicleReportResponse.builder()
                .id(vehicle.getId())
                .brand(vehicle.getBrand())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .engineCc(vehicle.getEngineCc())
                .pricePerDay(vehicle.getPricePerDay())
                .available(vehicle.isAvailable())
                .createdAt(vehicle.getCreatedAt())
                .reservationCount(reservations.size())
                .totalRevenue(totalRevenue)
                .weekdayDays(weekdayDays)
                .weekendDays(weekendDays);

        if (vehicle instanceof Car car) {
            builder.type("CAR")
                    .numSeats(car.getNumSeats())
                    .transmission(car.getTransmission())
                    .fuelType(car.getFuelType());
        } else if (vehicle instanceof Motorbike motorbike) {
            builder.type("MOTORBIKE")
                    .licenseCategory(motorbike.getLicenseCategory())
                    .motorbikeType(motorbike.getMotorbikeType())
                    .abs(motorbike.isAbs());
        }

        return builder.build();
    }
}
