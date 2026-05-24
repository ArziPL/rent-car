// ── Auth ──────────────────────────────────────────────────────────────────
export interface AuthResponse {
  token: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface AuthUser {
  email: string;
  role: "USER" | "ADMIN";
}

// ── Vehicles — discriminated union on `type` ──────────────────────────────
export interface VehicleBase {
  id: number;
  brand: string;
  model: string;
  year: number;
  engineCc: number;
  pricePerDay: number;
  available: boolean;
  createdAt: string;
}

export interface Car extends VehicleBase {
  type: "CAR";
  numSeats: number;
  transmission: Transmission;
  fuelType: FuelType;
  licenseCategory: null;
  motorbikeType: null;
  abs: null;
}

export interface Motorbike extends VehicleBase {
  type: "MOTORBIKE";
  licenseCategory: LicenseCategory;
  motorbikeType: MotorbikeType;
  abs: boolean;
  numSeats: null;
  transmission: null;
  fuelType: null;
}

export type Vehicle = Car | Motorbike;

// Lightweight list DTO from GET /api/vehicles
export interface VehicleListItem {
  id: number;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  available: boolean;
  type: "CAR" | "MOTORBIKE";
}

// ── Reservations ──────────────────────────────────────────────────────────
export interface ReservationResponse {
  id: number;
  vehicleId: number;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleType: "CAR" | "MOTORBIKE";
  startDate: string;
  endDate: string;
  status: ReservationStatus;
  totalPrice: number;
  createdAt: string;
}

export interface AdminReservationResponse extends ReservationResponse {
  userId: number;
  userEmail: string;
}

// ── Report ────────────────────────────────────────────────────────────────
export interface VehicleReportResponse extends VehicleBase {
  type: "CAR" | "MOTORBIKE";
  numSeats: number | null;
  transmission: Transmission | null;
  fuelType: FuelType | null;
  licenseCategory: LicenseCategory | null;
  motorbikeType: MotorbikeType | null;
  abs: boolean | null;
  reservationCount: number;
  totalRevenue: number;
  weekdayDays: number;
  weekendDays: number;
}

// ── Request DTOs ──────────────────────────────────────────────────────────
export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ReservationRequest {
  vehicleId: number;
  startDate: string;
  endDate: string;
}

export interface UpdateReservationStatusRequest {
  status: ReservationStatus;
}

export interface CarRequest {
  brand: string;
  model: string;
  year: number;
  engineCc: number;
  pricePerDay: number;
  numSeats: number;
  transmission: Transmission;
  fuelType: FuelType;
  available?: boolean;
}

export interface MotorbikeRequest {
  brand: string;
  model: string;
  year: number;
  engineCc: number;
  pricePerDay: number;
  licenseCategory: LicenseCategory;
  motorbikeType: MotorbikeType;
  abs: boolean;
  available?: boolean;
}

// ── Enums ─────────────────────────────────────────────────────────────────
export type ReservationStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type Transmission = "MANUAL" | "AUTOMATIC";
export type FuelType = "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID";
export type LicenseCategory = "A" | "A1" | "A2";
export type MotorbikeType = "SPORT" | "NAKED" | "CRUISER" | "SCOOTER";
