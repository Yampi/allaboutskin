# Rollback & Recovery Manifest - All About Skin

Este documento garantiza la trazabilidad total de todos los cambios implementados durante la auditoría, cableado de datos, optimización QoL y sistema de acciones Tri-State.

---

## 1. Puntos de Restauración Críticos

| Punto de Control | Commit Hash / Rama | Descripción | Comando de Reversión |
| :--- | :--- | :--- | :--- |
| **Baseline Pre-Auditoría** | `1f7133b` (`main`) | Estado original íntegro previo a cualquier modificación de la auditoría. | `git checkout main` o `git reset --hard 1f7133b` |
| **Commit Auditoría & QoL** | `a40302d` (`feature/audit-wiring-qol-innov`) | Entrega completa: Cableado real, Tri-State, QoL, Leads anónimos. | `git checkout feature/audit-wiring-qol-innov` |

---

## 2. Cómo realizar un Rollback Inmediato

Si deseas volver al estado original exacto previo a este trabajo:

```bash
# 1. Asegurar no tener cambios colgados
git reset --hard

# 2. Volver a la rama principal previa
git checkout main
```

Si deseas revertir únicamente un commit específico dentro de la rama:

```bash
git revert <COMMIT_HASH>
```

---

- **Fase 0 (Baseline & Setup)**: `1f7133b` - Commit de seguridad inicial.
- **Fase 1 (Tri-State Engine & Error Boundary)**: Completado — Manejador global en `bootstrap/app.php` registrando en `SecurityAuditLog`, middleware `EnsureUserHasRole` con respuestas tipadas.
- **Fase 2 (Cableado Real & Poda de Incoherencias)**: Completado — Eliminados gráficos de ventas fake y llamadas falsas; conectados contadores PostgreSQL en Admin, tiendas dinámicas y productos de rutina.
- **Fase 3 (QoL 3 Niveles: Admin / Tiendas / Rutina Inteligente)**: Completado — Fast-Country Modal con banderas preset para Admin, generador de WhatsApp prellenado para Tiendas, y Asistente con Cámara para detección de frascos y orden de rutina.
- **Fase 4 (Métricas B2B & Leads Anónimos sin PII)**: Completado — Reporte de brecha de demanda ("Demand Gap"), demografía anónima y métricas de leads salientes (`WHATSAPP_CLICK`, `MAP_ROUTE`).
- **Fase 5 (Security & Stress Tests)**: Completado — 38 tests PHPUnit pasando (219 aserciones), benchmark de estrés del crawler (82 QPS, 12ms latencia, 30MB RAM peak), y TypeScript 0 errores.
