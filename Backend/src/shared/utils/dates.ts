// dates.ts — Helpers de fechas y horarios
//
// Funciones puras (sin DB, sin req/res) que usan varios módulos.
// Guardar SIEMPRE en UTC en la
// DB y convertir a la zona horaria de la barbería solo al mostrar/calcular.
//
// Candidatas:
//   - toBarberTimezone(date)        → convierte UTC a la hora local de la barbería
//   - isSameDay(a, b)
//   - generateSlots(open, close, durationMin) → ["09:00", "09:30", ...]
//   - overlaps(startA, endA, startB, endB)    → para evitar turnos solapados
