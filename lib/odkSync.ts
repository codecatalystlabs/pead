import { prisma } from "./db"

// Option A: full OData .svc base (e.g. .../forms/YourFormId.svc) – append /Submissions
const ODK_BASE_URL = process.env.ODK_BASE_URL
// Option B: build URL from server + project + form xmlFormId (recommended – use form's xmlFormId, not display name)
const ODK_SERVER_URL = process.env.ODK_SERVER_URL // e.g. https://mohodk.dataug.net
const ODK_PROJECT_ID = process.env.ODK_PROJECT_ID // e.g. 91
const ODK_FORM_ID = process.env.ODK_FORM_ID     // form xmlFormId, e.g. Pediatric_Adolescent_HIV_Integration

const ODK_EMAIL = process.env.ODK_EMAIL
const ODK_PASSWORD = process.env.ODK_PASSWORD

function getOdkSubmissionsUrl(): string {
  if (ODK_BASE_URL) {
    const base = ODK_BASE_URL.replace(/\/$/, "")
    return base.endsWith(".svc") ? `${base}/Submissions` : `${base}.svc/Submissions`
  }
  if (ODK_SERVER_URL && ODK_PROJECT_ID && ODK_FORM_ID) {
    const server = ODK_SERVER_URL.replace(/\/$/, "")
    return `${server}/v1/projects/${ODK_PROJECT_ID}/forms/${encodeURIComponent(ODK_FORM_ID)}.svc/Submissions`
  }
  return ""
}

if (!getOdkSubmissionsUrl() || !ODK_EMAIL || !ODK_PASSWORD) {
  console.warn("ODK configuration missing – set either ODK_BASE_URL or (ODK_SERVER_URL + ODK_PROJECT_ID + ODK_FORM_ID), plus ODK_EMAIL and ODK_PASSWORD in .env.local")
}

interface OdkSubmission {
  __id?: string
  __system?: {
    submissionDate?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface OdataResponse {
  value: OdkSubmission[]
  [key: string]: unknown
}

// Submission scalar columns (excluding id, data, createdAt, updatedAt) and their Prisma type.
// Used to map SVC payload into typed columns. Groups are not stored as separate tables.
const SUBMISSION_DATE_FIELDS = new Set([
  "submissionDate",
  "A_6_Date_of_submission_yyyy_mm_dd",
])
const SUBMISSION_STRING_FIELDS = new Set([
  "A_1_Respondent_type",
  "A_1_Facility_type",
  "A_2_Name_of_reporting_unit",
  "A_3_Region",
  "A_4_1_District_Central_Region",
  "A_4_2_District_Eastern_Region",
  "A_4_3_District_Northern_Region",
  "A_4_4_District_Western_Region",
  "A_5_Reporting_period_quarter",
  "A_8_Designation_role",
  "region",
  "district",
  "facility",
  "C_9_1_Has_this_HF_re_ved_pALD_orientation",
  "C_9_2_Is_the_HF_curr_combination_of_pALD",
  "E_1_1_Has_this_HF_re_ation_on_integration",
  "E_1_3_Is_the_HF_curr_integrating_services",
  "B_4_4_If_yes_to_integrated_ser",
  "F_1_4_What_mode_of_training_in",
  "F_1_5_Have_you_had_support_sup",
  "F_1_6_Have_you_had_c_his_reporting_period",
  "F_1_7_What_topics_areas_were",
  "G_1_1_Which_of_the_f_t_this_HF_for_CALHIV",
  "D_1_Which_of_the_following_sec",
  "G_1_3_Which_of_the_f_t_this_HF_for_CALHIV",
  "F_2_1_Does_your_site_provide_p",
  "H_5_1_Does_this_HF_h_ate_Visitec_supplies",
  "H_5_2_Availability_o_s_and_reagents_at_HF",
  "H_5_3_Availability_o_CRAG_supplies_at_HF",
  "H_5_4_Availability_o_CRAG_supplies_at_HF",
  "H_5_5_Availability_o_PT_prophylaxis_at_HF",
  "H_5_6_Availability_o_conazole_prophylaxis",
  "H_5_7_Availability_of_CTX_prophylaxis",
  "H_5_8_Availability_of_anti_TB_drugs",
  "H_5_9_Availability_o_posomal_amphotericin",
  "H_5_10_Availability_of_RUTF_75_and_100",
  "H_5_11_Availability_of_dewormers",
  "I_1_2_For_those_who_id_the_HF_staff_take",
])
const SUBMISSION_INT_FIELDS = new Set([
  "total_calhiv_at_hf",
  "calhiv_3_5_9_kg",
  "calhiv_6_9_9_kg",
  "calhiv_10_13_9_kg",
  "calhiv_14_19_9_kg",
  "calhiv_20_24_9_kg",
  "B_2_6_How_many_ALHIV_ving_care_at_this_HF",
  "calhiv_greater_than_25_kg",
  "B_2_8_How_many_ALHIV_ving_care_at_this_HF",
  "B_3_1_Number_CLHIV_0_4_yrs",
  "B_3_2_How_many_CLHIV_5_9",
  "B_3_3_How_many_ALHIV_aged_10_1",
  "B_3_4_No_ALHIV_aged_15_19",
  "C_1_1_How_many_CLHIV_non_pALD_formulation",
  "C_1_2_How_many_CLHIV_non_pALD_formulation",
  "C_1_3_How_many_CLHIV_non_pALD_formulation",
  "C_1_4_How_many_CLHIV_non_pALD_formulation",
  "C_1_5_How_many_CLHIV_non_pALD_formulation",
  "C_1_6_How_many_ALHIV_non_pALD_formulation",
  "C_1_7_How_many_ALHIV_non_pALD_formulation",
  "C_2_1_How_many_CLHIV_non_pALD_formulation",
  "C_2_2_How_many_CLHIV_non_pALD_formulation",
  "C_2_3_How_many_ALHIV_non_pALD_formulation",
  "C_2_4_How_many_ALHIV_non_pALD_formulation",
  "C_3_1_How_many_CLHIV_mg_pALD_formulation",
  "C_3_2_How_many_CLHIV_mg_pALD_formulation",
  "C_3_3_How_many_CLHIV_mg_pALD_formulation",
  "C_3_4_How_many_CLHIV_mg_pALD_formulation",
  "C_3_5_How_many_CLHIV_mg_pALD_formulation",
  "pald_3_5_9_kg",
  "pald_6_9_9_kg",
  "pald_10_13_9_kg",
  "pald_14_19_9_kg",
  "pald_20_24_9_kg",
  "C_5_1_How_many_CLHIV_mg_pALD_formulation",
  "C_5_2_How_many_CLHIV_mg_pALD_formulation",
  "C_5_3_How_many_ALHIV_mg_pALD_formulation",
  "C_5_4_How_many_ALHIV_mg_pALD_formulation",
  "C_5_1_How_many_CLHIV_mg_pALD_formulation_001",
  "C_5_2_How_many_CLHIV_mg_pALD_formulation_001",
  "C_5_3_How_many_ALHIV_mg_pALD_formulation_001",
  "C_5_4_How_many_ALHIV_mg_pALD_formulation_001",
  "no_hf_staff_eligible_pald",
  "number_hf_staff_oriented_pald",
  "total_number_of_staff_hf",
  "number_at_hf_mixed_opd",
  "number_at_hf_clinic_day",
  "number_at_hf_other_models",
  "total_number_hw_at_site",
  "number_hw_trained_integra",
  "G_1_2_a_How_many_CAL_second_line_regimens",
  "G_1_2_b_How_many_CAL_second_line_regimen",
  "G_1_3_a_How_many_CAL_third_line_regimens",
  "G_3_1_What_is_the_cu_C_3TC_DTG_60_30_5_mg",
  "G_3_2_What_is_the_av_for_this_formulation",
  "G_3_3_What_is_the_mo_tock_MOS_available",
  "G_4_1_What_is_the_cu_or_ABC_3TC_120_60_mg",
  "G_4_2_What_is_the_av_for_this_formulation",
  "G_4_3_What_is_the_mo_tock_MOS_available",
  "G_5_1_What_is_the_cu_packs_for_DTG_10_mg",
  "G_5_2_What_is_the_av_for_this_formulation",
  "G_5_3_What_is_the_mo_tock_MOS_available",
  "G_6_1_What_is_the_cu_for_AZT_3TC_60_30_mg",
  "G_6_2_What_is_the_av_for_this_formulation",
  "G_6_3_What_is_the_mo_tock_MOS_available",
  "I_1_How_many_CALHIV_or_review_last_month",
  "I_1_1_Of_those_who_w_r_their_appointments",
  "J_1_1_Number_of_children_updat",
  "J_1_3_Number_of_chil_al_Load_0_4_years",
  "J_1_4_Number_of_children_supp",
  "J_2_1_Number_child_updated_vl",
  "J_2_3_Number_of_chil_al_Load_5_9_years",
  "J_2_4_Number_child_supp_vl",
  "J_3_1_Number_of_children_updat",
  "J_3_3_Number_of_chil_Load_10_14_years",
  "J_3_4_No_of_child_viral_supp",
  "J_4_1_No_an_updated_vl_15_19",
  "J_4_3_Number_missing_Load_15_19_years",
  "J_4_4_No_virally_suppressed",
  "J_5_1_tt_no_updated_vl_all",
  "J_5_3_Total_number_m_a_recent_Viral_Load",
  "J_5_4_Tt_no_of_CALHIV_supp",
  "K_1_1_No_clhiv_hlv_0_4",
  "K_1_2_Number_who_com_high_level_viraemia",
  "K_1_3_Number_who_com_high_level_viraemia",
  "K_1_4_Number_who_com_high_level_viraemia",
  "K_1_5_No_comp_3iac_0_4",
  "K_1_6_No_comp_4iac_0_4",
  "K_1_8_No_viral_supp_3iac_0_4",
  "K_1_10_Number_still_high_level_viraemia",
  "K_1_11_Number_referr_high_level_viraemia",
  "K_2_1_No_CALHIV_with_hlv",
  "K_2_2_Number_who_com_high_level_viraemia",
  "K_2_3_Number_who_com_high_level_viraemia",
  "K_2_4_Number_who_com_high_level_viraemia",
  "K_2_5_No_completed_3_iac_5_9",
  "K_2_6_No_completed_4_iac_5_9",
  "K_2_8_Number_who_ach_high_level_viraemia",
  "K_2_10_Number_still_high_level_viraemia",
  "K_2_11_Number_referr_high_level_viraemia",
  "K_3_1_No_of_CLHIV_hlv",
  "K_3_2_Number_who_com_high_level_viraemia",
  "K_3_3_Number_who_com_high_level_viraemia",
  "K_3_4_Number_who_com_high_level_viraemia",
  "K_3_5_No_completed_3_iac_10_14",
  "K_3_6_No_completed_4_iac_10_14",
  "K_3_8_No_achieved_supp_3_more",
  "K_3_10_Number_still_high_level_viraemia",
  "K_3_11_Number_referr_high_level_viraemia",
  "K_4_1_No_of_CALHIV_hlv",
  "K_4_2_Number_who_com_high_level_viraemia",
  "K_4_3_Number_who_com_high_level_viraemia",
  "K_4_4_Number_who_com_high_level_viraemia",
  "K_4_5_No_completed_3_iac",
  "K_4_6_No_completed_4_iac",
  "K_4_8_No_achieved_supp",
  "K_4_10_Number_still_high_level_viraemia",
  "K_4_11_Number_referr_high_level_viraemia",
  "L_1_1_No_of_CALHIV_with_llv",
  "L_1_2_Number_who_com_h_low_level_viraemia",
  "L_1_3_Number_who_com_h_low_level_viraemia",
  "L_1_4_Number_who_com_h_low_level_viraemia",
  "L_1_5_Number_who_com_h_low_level_viraemia",
  "L_1_6_Number_who_com_h_low_level_viraemia",
  "L_1_7_No_who_achieved_supp",
  "L_1_9_Number_still_w_h_low_level_viraemia",
  "L_2_1_No_CALHIV_with_llv",
  "L_2_2_Number_who_com_h_low_level_viraemia",
  "L_2_3_Number_who_com_h_low_level_viraemia",
  "L_2_4_Number_who_com_h_low_level_viraemia",
  "L_2_5_Number_who_com_h_low_level_viraemia",
  "L_2_6_Number_who_com_h_low_level_viraemia",
  "L_2_7_No_who_achieved_supp",
  "L_2_9_Number_still_w_h_low_level_viraemia",
  "L_3_1_No_of_CALHIV_with_llv",
  "L_3_2_Number_who_com_h_low_level_viraemia",
  "L_3_3_Number_who_com_h_low_level_viraemia",
  "L_3_4_Number_who_com_h_low_level_viraemia",
  "L_3_5_Number_who_com_h_low_level_viraemia",
  "L_3_6_Number_who_com_h_low_level_viraemia",
  "L_3_7_No_who_achieved_supp",
  "L_3_9_Number_still_w_h_low_level_viraemia",
  "L_4_1_No_of_CALHIV_llv",
  "L_4_2_Number_who_com_h_low_level_viraemia",
  "L_4_3_Number_who_com_h_low_level_viraemia",
  "L_4_4_Number_who_com_h_low_level_viraemia",
  "L_4_5_Number_who_com_h_low_level_viraemia",
  "L_4_6_Number_who_com_h_low_level_viraemia",
  "L_4_7_No_who_achieved_supp",
  "L_4_9_Number_still_w_h_low_level_viraemia",
  "M_1_1_No_enrolled_in_a_psy",
  "M_1_3_Number_enrolled_in_peer",
  "M_2_1_No_receiving_MMD_3",
  "M_2_3_Nuo_receiving_MMD_6",
  "M_3_1_No_under_Cddp",
  "M_3_3_No_under_Cclad",
  "M_3_5_No_under_Crpddp",
  "M_3_7_No_under_Fbim",
  "M_3_9_No_under_Fbg",
  "M_3_11_No_under_Ftdr",
])
// H_* Int fields from schema (exact names)
const H_INT_FIELDS = [
  "H_1_1_How_many_CLHIV_his_reporting_period", "H_1_2_How_many_CLHIV_his_reporting_period", "H_1_3_How_many_CLHIV_ays_of_disengagement",
  "H_1_4_How_many_CLHIV_g_during_this_period", "H_1_5_How_many_CLHIV_iven_as_a_percentage", "H_1_6_How_many_had_C_ercentage_CD4_cutoff",
  "H_1_7_How_many_were_TB_LAM_and_GeneXpert", "H_1_8_How_many_teste_TBLAM_and_GeneXpert", "H_1_9_How_many_of_th_ed_anti_TB_treatment",
  "H_1_10_How_many_test_TBLAM_and_GeneXpert", "H_1_11_Of_those_who_ow_many_received_TPT", "H_1_12_How_many_received_CTX_prophylaxis",
  "H_1_13_How_many_were_nutrition_using_MUAC", "H_1_14_How_many_were_malnourished", "H_1_15_How_many_maln_ion_for_malnutrition",
  "H_2_1_How_many_CLHIV_his_reporting_period", "H_2_2_How_many_CLHIV_his_reporting_period", "H_2_3_How_many_CLHIV_ays_of_disengagement",
  "H_2_4_How_many_CLHIV_g_during_this_period", "H_2_5_How_many_CLHIV_had_a_CD4_test_done", "H_2_6_How_many_CLHIV_ad_CD4_200_cells_L",
  "H_2_7_How_many_were_TB_LAM_and_GeneXpert", "H_2_8_How_many_teste_TBLAM_and_GeneXpert", "H_2_9_How_many_of_th_ed_anti_TB_treatment",
  "H_2_10_How_many_test_TBLAM_and_GeneXpert", "H_2_11_Of_those_who_ow_many_received_TPT", "H_2_12_How_many_received_CTX_prophylaxis",
  "H_2_13_How_many_were_nutrition_using_MUAC", "H_2_14_How_many_were_malnourished", "H_2_15_How_many_maln_ion_for_malnutrition",
  "H_3_1_How_many_ALHIV_his_reporting_period", "H_3_2_How_many_ALHIV_his_reporting_period", "H_3_3_How_many_ALHIV_ays_of_disengagement",
  "H_3_4_How_many_ALHIV_creening_this_period", "H_3_5_How_many_ALHIV_had_a_CD4_test_done", "H_3_6_How_many_ALHIV_ad_CD4_200_cells_L",
  "H_3_7_How_many_were_TB_LAM_and_GeneXpert", "H_3_8_How_many_teste_TBLAM_and_GeneXpert", "H_3_9_How_many_of_th_ed_anti_TB_treatment",
  "H_3_10_How_many_test_TBLAM_and_GeneXpert", "H_3_11_Of_those_who_ow_many_received_TPT", "H_3_12_How_many_received_CTX_prophylaxis",
  "H_3_13_How_many_were_nutrition_using_MUAC", "H_3_14_How_many_were_malnourished", "H_3_15_How_many_maln_ion_for_malnutrition",
  "H_3_16_How_many_rece_test_10_years_only", "H_3_17_Of_those_who_many_tested_positive", "H_3_18_Of_those_who_ot_a_lumbar_puncture",
  "H_3_19_Of_those_who_a_negative_CSF_CRAG", "H_3_20_Of_those_who_re_emptive_treatment", "H_3_21_How_many_were_nt_in_the_past_month",
  "H_3_22_Of_those_that_atment_and_are_alive", "H_3_23_Of_those_that_how_many_were_LTFU", "H_3_24_Of_those_that_month_how_many_died",
  "H_3_25_Of_those_who_a_positive_CSF_CRAG", "H_3_26_Of_those_who_gitis_CM_treatment", "H_3_27_Of_those_who_nt_in_the_past_month",
  "H_3_28_How_many_were_nt_in_the_past_month", "H_3_29_Of_those_that_atment_and_are_alive", "H_3_30_Of_those_that_how_many_were_LTFU",
  "H_3_31_Of_those_that_month_how_many_died",
  "H_4_1_How_many_ALHIV_his_reporting_period", "H_4_2_How_many_ALHIV_his_reporting_period", "H_4_3_How_many_ALHIV_ays_of_disengagement",
  "H_4_4_How_many_ALHIV_creening_this_period", "H_4_5_How_many_ALHIV_had_a_CD4_test_done", "H_4_6_How_many_ALHIV_ad_CD4_200_cells_L",
  "H_4_7_How_many_were_TB_LAM_and_GeneXpert", "H_4_8_How_many_teste_TBLAM_and_GeneXpert", "H_4_9_How_many_of_th_ed_anti_TB_treatment",
  "H_4_10_How_many_test_TBLAM_and_GeneXpert", "H_4_11_Of_those_who_ow_many_received_TPT", "H_4_12_How_many_received_CTX_prophylaxis",
  "H_4_13_How_many_were_nutrition_using_MUAC", "H_4_14_How_many_were_malnourished", "H_4_15_How_many_maln_ion_for_malnutrition",
  "H_4_16_How_many_rece_test_10_years_only", "H_4_17_Of_those_who_any_tested_positive_", "H_4_18_Of_those_who_ot_a_lumbar_puncture",
  "H_4_19_Of_those_who_a_negative_CSF_CRAG", "H_4_20_Of_those_who_re_emptive_treatment", "H_4_21_How_many_were_nt_in_the_past_month",
  "H_4_22_Of_those_that_atment_and_are_alive", "H_4_23_Of_those_that_how_many_were_LTFU", "H_4_24_Of_those_that_month_how_many_died",
  "H_4_25_Of_those_who_a_positive_CSF_CRAG", "H_4_26_Of_those_who_gitis_CM_treatment", "H_4_27_Of_those_who_nt_in_the_past_month",
  "H_4_28_Of_those_who_nt_in_the_past_month", "H_4_29_Of_those_that_atment_and_are_alive", "H_4_30_Of_those_that_how_many_were_LTFU",
  "H_4_31_Of_those_that_month_how_many_died",
]
H_INT_FIELDS.forEach((f) => SUBMISSION_INT_FIELDS.add(f))

function toInt(v: unknown): number | null {
  if (v == null) return null
  if (typeof v === "number" && !Number.isNaN(v)) return Math.round(v)
  if (Array.isArray(v)) {
    let sum = 0
    for (const item of v) {
      const n = toInt(item)
      if (n !== null) sum += n
    }
    return sum > 0 || v.length === 0 ? sum : null
  }
  const n = parseInt(String(v), 10)
  return Number.isNaN(n) ? null : n
}

function toDate(v: unknown): Date | null {
  if (v == null) return null
  if (v instanceof Date) return v
  const d = new Date(String(v))
  return Number.isNaN(d.getTime()) ? null : d
}

function toStringOrNull(v: unknown): string | null {
  if (v == null) return null
  return String(v)
}

/** Flatten nested object so nested keys are findable (ODK can return groups as nested objects or arrays). */
function flattenForLookup(obj: unknown, prefix = ""): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (obj == null || typeof obj !== "object") return out
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      Object.assign(out, flattenForLookup(item, `${prefix}.${i}`))
    })
    return out
  }
  const rec = obj as Record<string, unknown>
  for (const [k, v] of Object.entries(rec)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v != null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      Object.assign(out, flattenForLookup(v, key))
    } else {
      out[key] = v
    }
  }
  return out
}

/** Get value from flattened map: exact key or first key ending with .key (for nested ODK groups). */
function getFromFlattened(flat: Record<string, unknown>, key: string): unknown {
  if (flat[key] !== undefined) return flat[key]
  const suffix = `.${key}`
  for (const [k, v] of Object.entries(flat)) {
    if (k.endsWith(suffix)) return v
  }
  return undefined
}

/** For numeric fields: sum all values whose key ends with .key (repeat groups). Single value = that value. */
function getFromFlattenedSum(flat: Record<string, unknown>, key: string): unknown {
  const exact = flat[key]
  const suffix = `.${key}`
  const matches: unknown[] = []
  if (exact !== undefined) matches.push(exact)
  for (const [k, v] of Object.entries(flat)) {
    if (k !== key && k.endsWith(suffix)) matches.push(v)
  }
  if (matches.length === 0) return undefined
  if (matches.length === 1) return matches[0]
  return matches
}

/** Build create/update payload from SVC submission: id, data, submissionDate, region, district, facility + all typed columns. */
function buildSubmissionPayload(
  id: string,
  sub: OdkSubmission,
  submissionDate: Date | null,
  region: string | null,
  district: string | null,
  facility: string | null
): Record<string, unknown> {
  const flat = flattenForLookup(sub)

  const payload: Record<string, unknown> = {
    id,
    data: sub,
    submissionDate: submissionDate ?? undefined,
    region: region ?? undefined,
    district: district ?? undefined,
    facility: facility ?? undefined,
  }

  const allTypedKeys = new Set([
    ...SUBMISSION_DATE_FIELDS,
    ...SUBMISSION_STRING_FIELDS,
    ...SUBMISSION_INT_FIELDS,
  ])

  for (const key of allTypedKeys) {
    if (key === "submissionDate" || key === "region" || key === "district" || key === "facility") continue
    const raw =
      getFromFlattened(flat, key) ??
      (key === "submissionDate" ? sub.__system?.submissionDate : undefined)
    if (raw === undefined && key !== "A_6_Date_of_submission_yyyy_mm_dd") continue
    if (SUBMISSION_DATE_FIELDS.has(key)) {
      const d = key === "submissionDate" ? submissionDate : toDate(raw)
      if (d) payload[key] = d
    } else if (SUBMISSION_INT_FIELDS.has(key)) {
      const n = toInt(raw)
      if (n !== null) payload[key] = n
    } else {
      const s = toStringOrNull(raw)
      if (s !== null) payload[key] = s
    }
  }

  return payload
}

async function fetchAllSubmissionsFromOdk(): Promise<OdkSubmission[]> {
  const url = getOdkSubmissionsUrl()
  if (!url || !ODK_EMAIL || !ODK_PASSWORD) {
    throw new Error("ODK configuration not set")
  }

  const auth = Buffer.from(`${ODK_EMAIL}:${ODK_PASSWORD}`).toString("base64")

  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    if (res.status === 404) {
      throw new Error(
        `ODK form not found (404). Check that the form URL is correct. ` +
          `Use the form's xmlFormId (e.g. Pediatric_Adolescent_HIV_Integration), not the display name. ` +
          `In .env.local use ODK_SERVER_URL, ODK_PROJECT_ID, ODK_FORM_ID, or fix ODK_BASE_URL. Raw: ${text}`
      )
    }
    throw new Error(`Failed to fetch ODK submissions: ${res.status} ${res.statusText} – ${text}`)
  }

  const json = (await res.json()) as OdataResponse
  return json.value ?? []
}

export async function syncOdkToDatabase() {
  const syncLog = await prisma.syncLog.create({
    data: {
      status: "RUNNING",
      message: "Sync started",
    },
  })

  try {
    const submissions = await fetchAllSubmissionsFromOdk()

    let maxSubmissionDate: Date | null = null
    let processed = 0

    for (const sub of submissions) {
      const id = (sub.__id as string | undefined) ?? (sub["__id"] as string | undefined)
      if (!id) continue

      const submissionDateStr = sub.__system?.submissionDate as string | undefined
      const submissionDate =
        submissionDateStr && !Number.isNaN(Date.parse(submissionDateStr))
          ? new Date(submissionDateStr)
          : null

      if (submissionDate && (!maxSubmissionDate || submissionDate > maxSubmissionDate)) {
        maxSubmissionDate = submissionDate
      }

      const flatSub = flattenForLookup(sub)
      const region =
        (getFromFlattened(flatSub, "A_3_Region") as string | undefined) ??
        (getFromFlattened(flatSub, "region") as string | undefined) ??
        null
      const district =
        (getFromFlattened(flatSub, "A_4_1_District_Central_Region") as string | undefined) ??
        (getFromFlattened(flatSub, "A_4_2_District_Eastern_Region") as string | undefined) ??
        (getFromFlattened(flatSub, "A_4_3_District_Northern_Region") as string | undefined) ??
        (getFromFlattened(flatSub, "A_4_4_District_Western_Region") as string | undefined) ??
        (getFromFlattened(flatSub, "district") as string | undefined) ??
        null
      const facility =
        (getFromFlattened(flatSub, "A_2_Name_of_reporting_unit") as string | undefined) ??
        (getFromFlattened(flatSub, "facility") as string | undefined) ??
        null

      const payload = buildSubmissionPayload(id, sub, submissionDate, region, district, facility)

      await prisma.submission.upsert({
        where: { id },
        create: payload as any,
        update: payload as any,
      })

      processed += 1
    }

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        lastSubmissionDate: maxSubmissionDate ?? undefined,
        message: `Processed ${processed} submissions`,
      },
    })

    return { processed, lastSubmissionDate: maxSubmissionDate }
  } catch (error: any) {
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        message: error?.message ?? "Unknown error",
      },
    })
    throw error
  }
}
