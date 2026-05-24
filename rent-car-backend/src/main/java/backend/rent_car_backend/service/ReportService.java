package backend.rent_car_backend.service;

import backend.rent_car_backend.dto.CarReportResponse;
import backend.rent_car_backend.model.Car;
import backend.rent_car_backend.model.Reservation;
import backend.rent_car_backend.model.ReservationStatus;
import backend.rent_car_backend.repository.CarRepository;
import backend.rent_car_backend.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ReportService {

    private final CarRepository carRepository;
    private final ReservationRepository reservationRepository;

    public List<CarReportResponse> getCarReport() {
        return carRepository.findAll().stream()
                .map(this::toReportResponse)
                .toList();
    }

    private CarReportResponse toReportResponse(Car car) {
        List<Reservation> reservations = reservationRepository.findByVehicle(car)
                .stream()
                .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                .toList();

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

        return CarReportResponse.builder()
                .id(car.getId())
                .brand(car.getBrand())
                .model(car.getModel())
                .year(car.getYear())
                .engineCc(car.getEngineCc())
                .pricePerDay(car.getPricePerDay())
                .available(car.isAvailable())
                .numSeats(car.getNumSeats())
                .transmission(car.getTransmission())
                .fuelType(car.getFuelType())
                .createdAt(car.getCreatedAt())
                .reservationCount(reservations.size())
                .totalRevenue(totalRevenue)
                .weekdayDays(weekdayDays)
                .weekendDays(weekendDays)
                .build();
    }
}
