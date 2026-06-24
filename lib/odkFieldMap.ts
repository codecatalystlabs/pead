import type { FlatLowerMap } from "@/lib/jsonMetric"
import { sumPaths } from "@/lib/jsonMetric"

/** Age bands used across dashboard charts and filters. */
export const AGE_BAND_KEYS = ["0 - 4 years", "5 - 9 years", "10 - 14 years", "15 - 19 years"] as const
export type AgeBandKey = (typeof AGE_BAND_KEYS)[number]

/** Suffix variants in the current ODK form JSON (lowercased after flatten). */
export const AGE_SUFFIX: Record<AgeBandKey, string> = {
  "0 - 4 years": "under_5yrs",
  "5 - 9 years": "5_9yrs",
  "10 - 14 years": "10_14yrs",
  "15 - 19 years": "15_19yrs",
}

const B = "section_b"
const C = "section_c"
const D = "section_d"
const E = "section_e"
const F = "section_f"
const G = "sectiong"
const H = "section_h"
const I = "section_i"
const J = "section_j"
const K = "section_k"
const L = "section_l"

function agePaths(prefix: string, suffix: string, variants: string[] = []): string[] {
  const all = [suffix, ...variants]
  return all.flatMap((s) => [`${prefix}.${s}`, `${prefix}_${s}`])
}

/** Sum a metric across all age bands using known suffix patterns. */
export function sumByAge(flat: FlatLowerMap, prefix: string, suffixMap: Record<AgeBandKey, string>, extra?: Record<AgeBandKey, string[]>): number {
  return AGE_BAND_KEYS.reduce((acc, band) => {
    const suffix = suffixMap[band]
    const paths = agePaths(prefix, suffix, extra?.[band] ?? [])
    return acc + sumPaths(flat, paths)
  }, 0)
}

export function sumForAge(flat: FlatLowerMap, prefix: string, band: AgeBandKey, extra: string[] = []): number {
  const suffix = AGE_SUFFIX[band]
  return sumPaths(flat, agePaths(prefix, suffix, extra))
}

// ---- Section A (facility metadata) ----
export const META_PATHS = {
  region: ["section_a.region", "a_3_region"],
  district: ["section_a.district", "a_4_1_district_central_region"],
  facility: ["section_a.reporting_facility", "a_2_name_of_reporting_unit"],
  reportingQuarter: ["section_a.reporting_quarter", "a_5_reporting_period_quarter"],
  submissionDate: ["section_a.submission_date", "a_6_date_of_submission_yyyy_mm_dd"],
}

// ---- pALD / CALHIV (Section B & C) ----
export const PALD_PATHS = {
  totalCalhiv: [`${B}.total_number_recieving_care`, "total_calhiv_at_hf"],
  inCareByAge: {
    "0 - 4 years": [`${B}.number_of_calhiv_receiving_care_at_this_hf_by_age_band.under_5yrs_clhiv_receiving_care`],
    "5 - 9 years": [`${B}.number_of_calhiv_receiving_care_at_this_hf_by_age_band.clhiv_receiving_care5_9yrs`],
    "10 - 14 years": [`${B}.number_of_calhiv_receiving_care_at_this_hf_by_age_band.alhiv_receiving_care_10_14yrs`],
    "15 - 19 years": [`${B}.number_of_calhiv_receiving_care_at_this_hf_by_age_band.alhiv_receiving_care_15_19yrs`],
  } satisfies Record<AgeBandKey, string[]>,
  onPaldByAge: {
    "0 - 4 years": [`${C}.eligibile_and_transitioned_to_pald.clhiv_taking_pald_under_5yrs`],
    "5 - 9 years": [`${C}.eligibile_and_transitioned_to_pald.clhiv_taking_pald_5_9yrs`],
    "10 - 14 years": [`${C}.eligibile_and_transitioned_to_pald.alhiv_taking_pald_10_14yrs`, `${C}.percentage_transitioned.total_number_transitioned_by_age`],
    "15 - 19 years": [`${C}.eligibile_and_transitioned_to_pald.alhiv_taking_pald_15_19yrs`],
  } satisfies Record<AgeBandKey, string[]>,
  eligibleByAge: {
    "0 - 4 years": [`${C}.eligibility_to_transition_to_pald_ageband.clhiv_who_are_eligible_to_transition_under_5yrs`],
    "5 - 9 years": [`${C}.eligibility_to_transition_to_pald_ageband.clhiv_who_are_eligible_to_transition_5_9yrs`],
    "10 - 14 years": [`${C}.eligibility_to_transition_to_pald_ageband.alhiv_who_are_eligible_to_transition_10_14yrs`],
    "15 - 19 years": [`${C}.eligibility_to_transition_to_pald_ageband.alhiv_who_are_eligible_to_transition_15_19yrs`],
  } satisfies Record<AgeBandKey, string[]>,
  weightBands: [
    { band: "3 - 5.9 kg", calhiv: `${B}.number_of_calhiv_receiving_care_at_this_hf_by_weight_band.clhiv_recieving_care_3_5_9kg`, eligible: `${C}.eligibility_to_transition_to_pald_weightband.eligible_to_transition_to_pald_3_5_9kg`, transitioned: `${C}.eligibile_and_transitioned_by_weight.transtioned_to_pald_3_5_9kg` },
    { band: "6 - 9.9 kg", calhiv: `${B}.number_of_calhiv_receiving_care_at_this_hf_by_weight_band.clhiv_recieving_care_6_9_9kg`, eligible: `${C}.eligibility_to_transition_to_pald_weightband.eligible_to_transition_to_pald_6_9_9kg`, transitioned: `${C}.eligibile_and_transitioned_by_weight.transtioned_to_pald_6_9_9kg` },
    { band: "10 - 13.9 kg", calhiv: `${B}.number_of_calhiv_receiving_care_at_this_hf_by_weight_band.clhiv_recieving_care_10_13_9kg`, eligible: `${C}.eligibility_to_transition_to_pald_weightband.eligible_to_transition_to_pald_10_13_9kg`, transitioned: `${C}.eligibile_and_transitioned_by_weight.transtioned_to_pald_10_13_9kg` },
    { band: "14 - 19.9 kg", calhiv: `${B}.number_of_calhiv_receiving_care_at_this_hf_by_weight_band.clhiv_recieving_care_14_19_9kg`, eligible: `${C}.eligibility_to_transition_to_pald_weightband.eligible_to_transition_to_pald_14_19_9kg`, transitioned: `${C}.eligibile_and_transitioned_by_weight.transtioned_to_pald_14_19_9kg` },
    { band: "20 - 24.9 kg", calhiv: `${B}.number_of_calhiv_receiving_care_at_this_hf_by_weight_band.alhiv_recieving_care_20_24_9kg`, eligible: `${C}.eligibility_to_transition_to_pald_weightband.eligible_to_transition_to_pald_20_24_9kg`, transitioned: `${C}.eligibile_and_transitioned_by_weight.transtioned_to_pald_20_24_9kg` },
    { band: "≥25 kg", calhiv: `${B}.number_of_calhiv_receiving_care_at_this_hf_by_weight_band.above_30kg_alhiv_recieving_care`, eligible: `${C}.eligibility_to_transition_to_pald_weightband.eligible_to_transition_to_pald_25_29_9kg`, transitioned: `${C}.eligibile_and_transitioned_by_weight.transtioned_to_pald_25_29_9kg` },
  ],
  clinicDayPatients: [`${D}.clinic_day_model_calhiv_.number_registered_under_clinic_day_model`],
  nonPaldByWeight: [
    `${C}.number_of_calhiv__on_abc_3tc_dtg_120_60_10_mg_by_weight_band.clhiv_taking_non_pald_formulation_3_5_9kg`,
    `${C}.number_of_calhiv__on_abc_3tc_dtg_120_60_10_mg_by_weight_band.clhiv_taking_non_pald_formulation_6_9_9kg`,
    `${C}.number_of_calhiv__on_abc_3tc_dtg_120_60_10_mg_by_weight_band.clhiv_taking_non_pald_formulation_10_13_9kg`,
    `${C}.number_of_calhiv__on_abc_3tc_dtg_120_60_10_mg_by_weight_band.clhiv_taking_non_pald_formulation_14_19_9kg`,
    `${C}.number_of_calhiv__on_abc_3tc_dtg_120_60_10_mg_by_weight_band.alhiv_taking_non_pald_formulation_20_24_9kg`,
    `${C}.number_of_calhiv__on_abc_3tc_dtg_120_60_10_mg_by_weight_band.alhiv_taking_non_pald_formulation_25_29_9kg`,
    `${C}.number_of_calhiv__on_abc_3tc_dtg_120_60_10_mg_by_weight_band.above_30kg_alhiv_recieving_care`,
  ],
}

export function aggregatePaldFromFlat(flat: FlatLowerMap) {
  const totalCalhiv = sumPaths(flat, PALD_PATHS.totalCalhiv)
  const ageBandData = AGE_BAND_KEYS.map((age) => {
    const inCare = sumPaths(flat, PALD_PATHS.inCareByAge[age])
    const cap = inCare > 0 ? inCare : Number.POSITIVE_INFINITY
    const onPald = Math.min(cap, sumPaths(flat, PALD_PATHS.onPaldByAge[age]))
    const eligible = Math.min(cap, sumPaths(flat, PALD_PATHS.eligibleByAge[age]))
    return {
      age,
      inCare,
      onPald,
      eligible,
      pct: inCare > 0 ? Math.round((onPald / inCare) * 1000) / 10 : 0,
    }
  })
  const weightBandData = PALD_PATHS.weightBands.map(({ band, calhiv, eligible, transitioned }) => {
    const clhiv = sumPaths(flat, [calhiv])
    const elig = sumPaths(flat, [eligible])
    const trans = sumPaths(flat, [transitioned])
    return {
      band,
      clhiv,
      alhiv: 0,
      eligible: elig,
      transitioned: trans,
      pct: elig > 0 ? Math.round((trans / elig) * 1000) / 10 : 0,
    }
  })
  const paldOnPald = ageBandData.reduce((s, r) => s + r.onPald, 0) || weightBandData.reduce((s, r) => s + r.transitioned, 0)
  const paldEligible = ageBandData.reduce((s, r) => s + r.eligible, 0) || weightBandData.reduce((s, r) => s + r.eligible, 0)
  const nonPald = sumPaths(flat, PALD_PATHS.nonPaldByWeight)
  const clinicDay = sumPaths(flat, PALD_PATHS.clinicDayPatients)
  return { totalCalhiv, ageBandData, weightBandData, paldOnPald, paldEligible, nonPald, clinicDay }
}

// ---- Viral load (Section I) ----
export const VL_PATHS = {
  updated: {
    "0 - 4 years": [`${I}.number_of_calhiv_with_update_vl__under_5yrs`],
    "5 - 9 years": [`${I}.number_of_calhiv_with_update_vl_5_9yrs_`],
    "10 - 14 years": [`${I}.number_of_calhiv_with_update_vl_10_14yrs`],
    "15 - 19 years": [`${I}.number_of_calhiv_with_update_vl_15_19yrs_`],
  } satisfies Record<AgeBandKey, string[]>,
  suppressed: {
    "0 - 4 years": [`${I}.number_of_calhiv_virally_suppressed_under_5yrs`],
    "5 - 9 years": [`${I}.number_of_calhiv_virally_suppressed5_9yrs_`],
    "10 - 14 years": [`${I}.number_of_calhiv_virally_suppressed10_14yrs`],
    "15 - 19 years": [`${I}.number_of_calhiv_virally_suppressed15_19yrs_`],
  } satisfies Record<AgeBandKey, string[]>,
  missing: {
    "0 - 4 years": [`${I}.number_of_calhiv_missing_recent_vl_under_5yrs`],
    "5 - 9 years": [`${I}.number_of_calhiv_missing_recent_vl5_9yrs_`],
    "10 - 14 years": [`${I}.number_of_calhiv_missing_recent_vl10_14yrs`],
    "15 - 19 years": [`${I}.number_of_calhiv_missing_recent_vl15_19yrs_`],
  } satisfies Record<AgeBandKey, string[]>,
}

export function aggregateVlFromFlat(flat: FlatLowerMap) {
  let updated = 0
  let suppressed = 0
  for (const band of AGE_BAND_KEYS) {
    const inCare = sumPaths(flat, PALD_PATHS.inCareByAge[band])
    const cap = inCare > 0 ? inCare : Number.POSITIVE_INFINITY
    const u = Math.min(cap, sumPaths(flat, VL_PATHS.updated[band]))
    const s = Math.min(u, sumPaths(flat, VL_PATHS.suppressed[band]))
    updated += u
    suppressed += s
  }
  return { updated, suppressed }
}

// ---- HLV / IAC (Section J) ----
export function hlvPaths(metric: string, band: AgeBandKey): string[] {
  const sfx = AGE_SUFFIX[band]
  const under5 = band === "0 - 4 years" ? ["under_5_yrs", "under_5yrs", "unde5yrs"] : []
  return agePaths(`${J}.${metric}`, sfx, under5)
}

export const HLV_METRICS = {
  hlv: "number_with_hlv",
  iac1: "number_with_hlv_completed_1_iac_sessions",
  iac2: "number_with_hlv_completed_2_iac_sessions",
  iac3: "number_with_hlv_completed_3iac_sessions",
  iac4Plus: "number_with_hlv_completed_above_4iac_sessions",
  suppressed: "number_with_hlv_supressed_after_4_sessions",
  unsuppressed: "number_with_hlv_still_supressing_after_iac",
  drReferred: "number_with_hlv_refered_for_dr_testing",
  drSwitched: "number_with_hlv_switched_regimen_after_dr_testing",
} as const

// ---- LLV (section K) ----
export function llvPaths(metric: string, band: AgeBandKey): string[] {
  const sfx = AGE_SUFFIX[band]
  const under5 = band === "0 - 4 years" ? ["under_5_yrs", "under_5yrs"] : []
  if (metric === "iac4Plus") return agePaths(`${K}.number_with_llv_completed_over_3iac_sessions`, sfx, under5)
  if (metric === "stillLLVorHLV") {
    const alt = band === "10 - 14 years" ? [`${K}.number_still_with_llv_or_progressed_to_hlv10_14yrs`] : []
    return [...agePaths(`${K}.number_still_with_llv_or_progressed_to_hlv`, sfx, under5), ...alt]
  }
  if (metric === "llv") return agePaths(`${K}.number_with_llv`, sfx, under5)
  if (metric === "iac1") return agePaths(`${K}.number_with_llv_completed_1_iac_sessions`, sfx, under5)
  if (metric === "iac2") return agePaths(`${K}.number_with_llv_completed_2_iac_sessions`, sfx, under5)
  if (metric === "iac3") return agePaths(`${K}.number_with_llv_completed_3iac_sessions`, sfx, under5)
  if (metric === "suppressed") return agePaths(`${K}.number_with_llv_supressed_after_4_sessions`, sfx, under5)
  return agePaths(`${K}.number_with_llv`, sfx, under5)
}

// ---- AHD cascades (SectionG) ----
export const AHD_PREFIX = {
  newlyDiagnosed: `${G}.newly_diagnosed.number_diagnosed_newly_diagonised`,
  unsuppressed: `${G}.number_non_supressed.number_unsuppressed`,
  reEngaged: `${G}.calhiv_re_engaed_in_care.number_re_engaged`,
  cd4New: `${G}.newly_diagnosed.number_diagnosed_cd4_less_than_200`,
  cd4Unsup: `${G}.number_non_supressed.number_unsuppressed_cd4_less_than_200`,
  cd4Re: `${G}.calhiv_re_engaed_in_care.number_re_engaged_cd4_less_than_200`,
  tbScreened: `${G}.newly_diagnosed.number_diagnosed_screened_for_malnutrition`,
  tbPositive: `${G}.newly_diagnosed.number_diagnosed_tested_positive_with_tblam_n_genexpert`,
  tbTreatment: `${G}.newly_diagnosed.number_diagnosed_started_on_tb_treatment`,
  tbScreenedUnsup: `${G}.number_non_supressed.number_unsuppressed_screened_for_malnutrition`,
  tbPositiveUnsup: `${G}.number_non_supressed.number_unsuppressed_tested_positive_with_tblam_n_genexpert`,
  tbTreatmentUnsup: `${G}.number_non_supressed.number_unsuppressed_started_on_tb_treatment`,
  cragScreened: `${G}.newly_diagnosed.number_diagnosed_recieved_serum_crag_test`,
  cragPositive: `${G}.newly_diagnosed.number_diagnosed_positive_crag_test`,
  cmTreatment: `${G}.newly_diagnosed.number_diagnosed_started_cm_treatment`,
  cragScreenedUnsup: `${G}.number_non_supressed.number_unsuppressed_recieved_serum_crag_test`,
  cragPositiveUnsup: `${G}.number_non_supressed.number_unsuppressed_positive_crag_test`,
  cmTreatmentUnsup: `${G}.number_non_supressed.number_unsuppressed_started_cm_treatment`,
}

export function ahdForAge(flat: FlatLowerMap, band: AgeBandKey) {
  const sfx = AGE_SUFFIX[band]
  const under5Alt = band === "0 - 4 years" ? ["under_5yrs", "below_5"] : []
  const paths = (prefix: string) => agePaths(prefix, sfx, under5Alt)
  const newlyDiagnosed = sumPaths(flat, paths(AHD_PREFIX.newlyDiagnosed))
  const unsuppressed = sumPaths(flat, paths(AHD_PREFIX.unsuppressed))
  const reEngaged = sumPaths(flat, paths(AHD_PREFIX.reEngaged))
  const cd4 =
    sumPaths(flat, paths(AHD_PREFIX.cd4New)) +
    sumPaths(flat, paths(AHD_PREFIX.cd4Unsup)) +
    sumPaths(flat, paths(AHD_PREFIX.cd4Re))
  const tbScreened =
    sumPaths(flat, paths(AHD_PREFIX.tbScreened)) + sumPaths(flat, paths(AHD_PREFIX.tbScreenedUnsup))
  const tbPositive =
    sumPaths(flat, paths(AHD_PREFIX.tbPositive)) + sumPaths(flat, paths(AHD_PREFIX.tbPositiveUnsup))
  const tbTreatment =
    sumPaths(flat, paths(AHD_PREFIX.tbTreatment)) + sumPaths(flat, paths(AHD_PREFIX.tbTreatmentUnsup))
  const cragScreened =
    sumPaths(flat, paths(AHD_PREFIX.cragScreened)) + sumPaths(flat, paths(AHD_PREFIX.cragScreenedUnsup))
  const cragPositive =
    sumPaths(flat, paths(AHD_PREFIX.cragPositive)) + sumPaths(flat, paths(AHD_PREFIX.cragPositiveUnsup))
  const cmTreatment =
    sumPaths(flat, paths(AHD_PREFIX.cmTreatment)) + sumPaths(flat, paths(AHD_PREFIX.cmTreatmentUnsup))
  return { newlyDiagnosed, unsuppressed, reEngaged, cd4, tbScreened, tbPositive, tbTreatment, cragScreened, cragPositive, cmTreatment }
}

// ---- Capacity / retention (Section D, C, E, H) ----
export const CAPACITY_PATHS = {
  staffEligible: [`${D}.care_model_adopted.total_staff_eligible_for_training`],
  staffTrained: [`${D}.care_model_adopted.total_staff_trained`, `${D}.care_model_adopted.number_trained_and_still_employed`],
  staffTrainedByDomain: [
    `${D}.care_model_adopted.administrative_staff_trained`,
    `${D}.care_model_adopted.counselling_staff_trained`,
    `${D}.care_model_adopted.medical_and_clinical_officers_trained`,
    `${D}.care_model_adopted.nursing_staff_trained`,
    `${D}.care_model_adopted.support_staff_trained`,
  ],
  paldOrientedEligible: [`${C}.knowledge_on_pald_formulation.hf_staff_eligible_for_pald_orientation`],
  paldOriented: [`${C}.knowledge_on_pald_formulation.total_number_staff_oriented`, `${C}.knowledge_on_pald_formulation.staff_oriented_in_pald_and_still_employed`],
  retentionExpected: [`${H}.calhiv_was_this_hf_expecting_to_come_back_for_review`],
  retentionKept: [`${H}.how_many_actually_returned_for_their_scheduled_appointments`],
  inCare: [`${L}.number_in_care`, `${B}.total_number_recieving_care`],
  supportSupervision: [`${E}.capacity_building_at_hf.had_support_supervision`],
  mentorship: [`${E}.capacity_building_at_hf.had_coaching_and_mentorship`],
}

// ---- MMD / DSD / support (Section L) ----
export const MMD_PATHS = {
  mmd3: [`${L}.number_receiving_mmd_3months_5_9yrs`, `${L}.number_receiving_mmd_3months_10_14yrs`, `${L}.number_receiving_mmd_3months_15_19yrs`, `${L}.number_receiving_mmd_3months_under_5yrs`],
  mmd6: [`${L}.number_receiving_mmd_6months_5_9yrs`, `${L}.number_receiving_mmd_6months_10_14yrs`, `${L}.number_receiving_mmd_6months_15_19yrs`, `${L}.number_receiving_mmd_6months_under_5yrs`],
  cddp: [`${L}.number_under_cddp_5_9yrs`, `${L}.number_under_cddp_10_14yrs`, `${L}.number_under_cddp_15_19yrs`],
  cclad: [`${L}.number_under_cclad_5_9yrs`, `${L}.number_under_cclad_10_14yrs`, `${L}.number_under_cclad_15_19yrs`],
  crpddp: [`${L}.number_under_crpddp_5_9yrs`, `${L}.number_under_crpddp_10_14yrs`, `${L}.number_under_crpddp_15_19yrs`],
  fbim: [`${L}.number_under_fbim_5_9yrs`, `${L}.number_under_fbim_10_14yrs`, `${L}.number_under_fbim_15_19yrs`],
  fbg: [`${L}.number_under_fbg_5_9yrs`, `${L}.number_under_fbg_10_14yrs`, `${L}.number_under_fbg_15_19yrs`],
  ftdr: [`${L}.number_under_ftdr_5_9yrs`, `${L}.number_under_ftdr_10_14yrs`, `${L}.number_under_ftdr_15_19yrs`],
  peer: [`${L}.number_enrolled_for_teen_club_5_9yrs`, `${L}.number_enrolled_for_teen_club_10_14yrs`, `${L}.number_enrolled_for_teen_club_15_19yrs`],
  psychosocial: [`${L}.number_enrolleipeer`, `${L}.number_enrolled_in_psychosocial`],
}

// ---- Commodities (Section F) ----
export const COMMODITY_PATHS = {
  mosPALD: [`${F}.abc_3tc_dtg_60_30_5mg_90tabs_months_of_stock`, `${F}.abc_3tc_dtg_60_30_5mg_180tabs_months_of_stock`],
  mosAbc3tc: [`${F}.abc_3tc_120_60mg_months_of_stock`],
  mosDtg10: [`${F}.dtg_10mg_months_of_stock`],
  mosAzt3tc: [`${F}.azt_3tc_60_30mg_months_of_stock`],
  mosDrv: [`${F}.darunavir_months_of_stock`],
}

/** Maps legacy Prisma column names to current ODK JSON paths (for sync denormalization). */
export const SYNC_COLUMN_ALIASES: Record<string, string[]> = {
  region: META_PATHS.region,
  district: META_PATHS.district,
  facility: META_PATHS.facility,
  A_5_Reporting_period_quarter: META_PATHS.reportingQuarter,
  A_6_Date_of_submission_yyyy_mm_dd: META_PATHS.submissionDate,
  total_calhiv_at_hf: PALD_PATHS.totalCalhiv,
  B_3_1_Number_CLHIV_0_4_yrs: PALD_PATHS.inCareByAge["0 - 4 years"],
  B_3_2_How_many_CLHIV_5_9: PALD_PATHS.inCareByAge["5 - 9 years"],
  B_3_3_How_many_ALHIV_aged_10_1: PALD_PATHS.inCareByAge["10 - 14 years"],
  B_3_4_No_ALHIV_aged_15_19: PALD_PATHS.inCareByAge["15 - 19 years"],
  calhiv_3_5_9_kg: [`${B}.number_of_calhiv_receiving_care_at_this_hf_by_weight_band.clhiv_recieving_care_3_5_9kg`],
  calhiv_6_9_9_kg: [`${B}.number_of_calhiv_receiving_care_at_this_hf_by_weight_band.clhiv_recieving_care_6_9_9kg`],
  calhiv_10_13_9_kg: [`${B}.number_of_calhiv_receiving_care_at_this_hf_by_weight_band.clhiv_recieving_care_10_13_9kg`],
  calhiv_14_19_9_kg: [`${B}.number_of_calhiv_receiving_care_at_this_hf_by_weight_band.clhiv_recieving_care_14_19_9kg`],
  calhiv_20_24_9_kg: [`${B}.number_of_calhiv_receiving_care_at_this_hf_by_weight_band.alhiv_recieving_care_20_24_9kg`],
  calhiv_greater_than_25_kg: [`${B}.number_of_calhiv_receiving_care_at_this_hf_by_weight_band.above_30kg_alhiv_recieving_care`],
  C_3_1_How_many_CLHIV_mg_pALD_formulation: [`${C}.eligibility_to_transition_to_pald_weightband.eligible_to_transition_to_pald_3_5_9kg`],
  C_3_2_How_many_CLHIV_mg_pALD_formulation: [`${C}.eligibility_to_transition_to_pald_weightband.eligible_to_transition_to_pald_6_9_9kg`],
  C_3_3_How_many_CLHIV_mg_pALD_formulation: [`${C}.eligibility_to_transition_to_pald_weightband.eligible_to_transition_to_pald_10_13_9kg`],
  C_3_4_How_many_CLHIV_mg_pALD_formulation: [`${C}.eligibility_to_transition_to_pald_weightband.eligible_to_transition_to_pald_14_19_9kg`],
  C_3_5_How_many_CLHIV_mg_pALD_formulation: [`${C}.eligibility_to_transition_to_pald_weightband.eligible_to_transition_to_pald_20_24_9kg`],
  pald_3_5_9_kg: [`${C}.eligibile_and_transitioned_by_weight.transtioned_to_pald_3_5_9kg`],
  pald_6_9_9_kg: [`${C}.eligibile_and_transitioned_by_weight.transtioned_to_pald_6_9_9kg`],
  pald_10_13_9_kg: [`${C}.eligibile_and_transitioned_by_weight.transtioned_to_pald_10_13_9kg`],
  pald_14_19_9_kg: [`${C}.eligibile_and_transitioned_by_weight.transtioned_to_pald_14_19_9kg`],
  pald_20_24_9_kg: [`${C}.eligibile_and_transitioned_by_weight.transtioned_to_pald_20_24_9kg`],
  C_5_1_How_many_CLHIV_mg_pALD_formulation: PALD_PATHS.onPaldByAge["0 - 4 years"],
  C_5_2_How_many_CLHIV_mg_pALD_formulation: PALD_PATHS.onPaldByAge["5 - 9 years"],
  C_5_3_How_many_ALHIV_mg_pALD_formulation: PALD_PATHS.onPaldByAge["10 - 14 years"],
  C_5_4_How_many_ALHIV_mg_pALD_formulation: PALD_PATHS.onPaldByAge["15 - 19 years"],
  no_hf_staff_eligible_pald: CAPACITY_PATHS.paldOrientedEligible,
  number_hf_staff_oriented_pald: CAPACITY_PATHS.paldOriented,
  total_number_hw_at_site: CAPACITY_PATHS.staffEligible,
  number_hw_trained_integra: CAPACITY_PATHS.staffTrained,
  number_at_hf_clinic_day: PALD_PATHS.clinicDayPatients,
  I_1_How_many_CALHIV_or_review_last_month: CAPACITY_PATHS.retentionExpected,
  I_1_1_Of_those_who_w_r_their_appointments: CAPACITY_PATHS.retentionKept,
  G_3_3_What_is_the_mo_tock_MOS_available: COMMODITY_PATHS.mosPALD,
  G_4_3_What_is_the_mo_tock_MOS_available: COMMODITY_PATHS.mosAbc3tc,
  G_5_3_What_is_the_mo_tock_MOS_available: COMMODITY_PATHS.mosDtg10,
  G_6_3_What_is_the_mo_tock_MOS_available: COMMODITY_PATHS.mosAzt3tc,
  M_2_1_No_receiving_MMD_3: MMD_PATHS.mmd3,
  M_2_3_Nuo_receiving_MMD_6: MMD_PATHS.mmd6,
  M_3_1_No_under_Cddp: MMD_PATHS.cddp,
  M_3_3_No_under_Cclad: MMD_PATHS.cclad,
  M_3_5_No_under_Crpddp: MMD_PATHS.crpddp,
  M_3_7_No_under_Fbim: MMD_PATHS.fbim,
  M_3_9_No_under_Fbg: MMD_PATHS.fbg,
  M_3_11_No_under_Ftdr: MMD_PATHS.ftdr,
  M_1_3_Number_enrolled_in_peer: MMD_PATHS.peer,
  J_5_1_tt_no_updated_vl_all: Object.values(VL_PATHS.updated).flat(),
  J_5_4_Tt_no_of_CALHIV_supp: Object.values(VL_PATHS.suppressed).flat(),
}
