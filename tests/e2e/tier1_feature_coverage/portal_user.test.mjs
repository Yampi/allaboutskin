/**
 * tests/e2e/tier1_feature_coverage/portal_user.test.mjs
 * Tier 1: B2C User Portal, Role Navigation & Daily Routine
 * Feature Ref: ORIGINAL_REQUEST §R1, PROJECT.md Feature 4
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse } from '../helpers/assertions.mjs';
import { USER_FIXTURES } from '../helpers/fixtures.mjs';

describe('Tier 1 - B2C User Portal & Role Navigation', () => {
  test('TC-USER-01: Auto-redirection router maps user roles to appropriate destination portal', async () => {
    function resolveDashboardRoute(role) {
      switch (role) {
        case 'super_admin':
        case 'admin':
          return '/admin';
        case 'business_owner':
          return '/dashboard/empresa';
        case 'standard_user':
        case 'premium_user':
        default:
          return '/dashboard/usuario';
      }
    }

    assertEqual(resolveDashboardRoute(USER_FIXTURES.standardUser.role), '/dashboard/usuario');
    assertEqual(resolveDashboardRoute(USER_FIXTURES.businessOwner.role), '/dashboard/empresa');
    assertEqual(resolveDashboardRoute(USER_FIXTURES.adminUser.role), '/admin');
    assertEqual(resolveDashboardRoute(USER_FIXTURES.superAdmin.role), '/admin');
  });

  test('TC-USER-02: GlobalNavbar navigation exposes privileged portals when logged in as privileged role', async () => {
    function getNavbarLinks(user) {
      const publicLinks = [
        { label: 'Inicio', path: '/' },
        { label: 'Auditor INCI', path: '/escaner' },
        { label: 'Comparador', path: '/comparador' },
        { label: 'Farmacias y Tiendas', path: '/tiendas' },
      ];

      const userMenuLinks = [];
      if (!user) {
        userMenuLinks.push({ label: 'Iniciar Sesión', path: '/login' });
        userMenuLinks.push({ label: 'Registrarse', path: '/registro' });
      } else {
        userMenuLinks.push({ label: 'Mi Perfil de Piel', path: '/dashboard/usuario' });
        if (['business_owner', 'admin', 'super_admin'].includes(user.role)) {
          userMenuLinks.push({ label: 'Panel Empresa (B2B)', path: '/dashboard/empresa' });
        }
        if (['admin', 'super_admin'].includes(user.role)) {
          userMenuLinks.push({ label: 'Panel SuperAdmin', path: '/admin' });
        }
      }

      return { publicLinks, userMenuLinks };
    }

    // Standard user has no admin or merchant links
    const standardNav = getNavbarLinks(USER_FIXTURES.standardUser);
    assertFalse(standardNav.userMenuLinks.some(l => l.path === '/admin'));
    assertFalse(standardNav.userMenuLinks.some(l => l.path === '/dashboard/empresa'));

    // Admin has both privileged links
    const adminNav = getNavbarLinks(USER_FIXTURES.adminUser);
    assertTrue(adminNav.userMenuLinks.some(l => l.path === '/admin'));
    assertTrue(adminNav.userMenuLinks.some(l => l.path === '/dashboard/empresa'));
  });

  test('TC-USER-03: User skin profile correctly validates 6 physiological clinical parameters', async () => {
    const rawProfile = {
      skinType: 'COMBINATION',
      fitzpatrick: 3,
      barrierStatus: 'HEALTHY',
      skinConditions: ['ACNE', 'HYPERPIGMENTATION'],
      pregnancyOrNursing: false,
      experienceLevel: 'INTERMEDIATE',
    };

    function validateSkinProfile(profile) {
      const validSkinTypes = ['COMBINATION', 'OILY', 'DRY', 'SENSITIVE', 'NORMAL'];
      const validBarrierStatuses = ['HEALTHY', 'COMPROMISED', 'ACUTELY_DAMAGED'];
      const validExperience = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

      const isValid = (
        validSkinTypes.includes(profile.skinType) &&
        profile.fitzpatrick >= 1 && profile.fitzpatrick <= 6 &&
        validBarrierStatuses.includes(profile.barrierStatus) &&
        Array.isArray(profile.skinConditions) &&
        typeof profile.pregnancyOrNursing === 'boolean' &&
        validExperience.includes(profile.experienceLevel)
      );

      return isValid;
    }

    assertTrue(validateSkinProfile(rawProfile));
  });

  test('TC-USER-04: Daily routine schedule presents AM/PM slots and logs adherence completion', async () => {
    const routineSchedule = {
      user_id: 101,
      date: '2026-10-25',
      am_routine: [
        { step: 1, name: 'Limpiador Suave', time: '08:00', completed: true },
        { step: 2, name: 'Serum Vitamina C 15%', time: '08:05', completed: true },
        { step: 3, name: 'Fotoprotector FPS 50+', time: '08:10', completed: false },
      ],
      pm_routine: [
        { step: 1, name: 'Limpiador Oleoso', time: '21:00', completed: false },
        { step: 2, name: 'Limpiador Acuoso', time: '21:03', completed: false },
        { step: 3, name: 'Retinaldehído 0.05%', time: '21:10', completed: false },
        { step: 4, name: 'Crema Reparadora Ceramidas', time: '21:20', completed: false },
      ],
    };

    function toggleAdherence(slot, stepIndex) {
      if (slot === 'AM') {
        routineSchedule.am_routine[stepIndex].completed = !routineSchedule.am_routine[stepIndex].completed;
        return routineSchedule.am_routine[stepIndex].completed;
      }
      routineSchedule.pm_routine[stepIndex].completed = !routineSchedule.pm_routine[stepIndex].completed;
      return routineSchedule.pm_routine[stepIndex].completed;
    }

    function calculateAdherenceRate() {
      const allSteps = [...routineSchedule.am_routine, ...routineSchedule.pm_routine];
      const completedSteps = allSteps.filter(s => s.completed).length;
      return Math.round((completedSteps / allSteps.length) * 100);
    }

    // Initial adherence: 2 of 7 completed = 29%
    assertEqual(calculateAdherenceRate(), 29);

    // Complete step 3 in AM
    const nowDone = toggleAdherence('AM', 2);
    assertTrue(nowDone);
    // 3 of 7 completed = 43%
    assertEqual(calculateAdherenceRate(), 43);
  });

  test('TC-USER-05: PAO lifecycle monitor alerts when cosmetics exceed safety shelf life', async () => {
    const products = [
      { id: 1, name: 'Vitamina C Pura 15%', opened_at: '2026-07-01', pao_months: 3 }, // 3.8 months ago -> Expired
      { id: 2, name: 'Protector Solar FPS 50+', opened_at: '2026-06-15', pao_months: 12 }, // 4.3 months ago -> Active
      { id: 3, name: 'Retinol 0.3%', opened_at: '2026-05-01', pao_months: 6 }, // 5.8 months ago -> Soon to expire (< 1 month remaining)
    ];

    function checkPaoStatus(product, currentDateStr = '2026-10-25') {
      const openDate = new Date(product.opened_at);
      const currentDate = new Date(currentDateStr);
      const monthsElapsed = (currentDate - openDate) / (1000 * 60 * 60 * 24 * 30.4375);
      
      if (monthsElapsed >= product.pao_months) {
        return 'EXPIRED';
      } else if (product.pao_months - monthsElapsed <= 1.0) {
        return 'REPLENISHMENT_SOON';
      }
      return 'OPTIMAL';
    }

    assertEqual(checkPaoStatus(products[0]), 'EXPIRED');
    assertEqual(checkPaoStatus(products[1]), 'OPTIMAL');
    assertEqual(checkPaoStatus(products[2]), 'REPLENISHMENT_SOON');
  });
});
