<template>
  <div v-if="batch" class="batch-detail">

    <!-- Header -->
    <div class="page-header">
      <div>
        <NuxtLink to="/dashboard" class="back-link">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L4 7l5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Dashboard
        </NuxtLink>
        <p class="page-eyebrow">{{ batch.batchId }} · Fermenter {{ batch.fermenter }}</p>
        <h1 class="page-title">{{ batch.productName }}</h1>
      </div>
      <div class="page-actions">
        <span class="status-chip" :class="`chip--${batch.status}`">{{ statusLabel }}</span>
        <button v-if="!batchLocked" class="discard-btn" @click="openDiscardDialog()">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3h9M4.5 3V2h4v1M5 5.5v4M8 5.5v4M3 3l.5 7.5A1 1 0 004.5 11.5h4a1 1 0 001-.9L10 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Discard batch
        </button>
        <button v-if="!batchLocked" class="corrective-btn" @click="openCorrectivePanel('')">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 4v4M6.5 9.5v.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.2"/></svg>
          Corrective action
        </button>
      </div>
    </div>

    <!-- Locked banner -->
    <div v-if="batchLocked" class="alert-locked" :class="{ 'alert-locked--disposed': batch.status === 'disposed' }">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="2.5" y="5.5" width="8" height="6" rx="1.2" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 5.5V4a2 2 0 014 0v1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
      <span>
        <strong>{{ batch.status === 'disposed' ? 'Batch discarded' : 'Batch complete' }}</strong> — this record is read-only.
        <span v-if="batch.status === 'disposed' && (batch as any).disposedReason" class="disposed-reason">{{ (batch as any).disposedReason }}</span>
      </span>
    </div>

    <!-- Completion summary -->
    <div v-if="batch.stage > 0" class="completion-summary">
      <button type="button" class="cs-header" :style="batchLocked ? 'cursor:default' : ''" @click="!batchLocked && (showSummary = !showSummary)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3" y="1.5" width="8" height="11" rx="1.3" stroke="currentColor" stroke-width="1.3"/><path d="M5 5h4M5 7.5h4M5 10h2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
        Batch record
        <span style="flex:1" />
        <svg v-if="!batchLocked" class="cs-chevron" :class="{ 'cs-chevron--open': showSummary }" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 5.5l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>

      <template v-if="showSummary || batchLocked">

      <!-- Key stats row -->
      <div class="cs-stats">
        <div class="cs-stat">
          <div class="cs-stat-label">OG</div>
          <div class="cs-stat-val">{{ ogDisplay }}</div>
        </div>
        <div class="cs-stat">
          <div class="cs-stat-label">FG</div>
          <div class="cs-stat-val">{{ latestSG ?? '1.000' }}</div>
        </div>
        <div class="cs-stat">
          <div class="cs-stat-label">Est. ABV</div>
          <div class="cs-stat-val">{{ estimatedAbv ?? '—' }}</div>
        </div>
        <div class="cs-stat">
          <div class="cs-stat-label">Cans filled</div>
          <div class="cs-stat-val">{{ completionCansTotal }}</div>
        </div>
        <div class="cs-stat">
          <div class="cs-stat-label">Best before</div>
          <div class="cs-stat-val">{{ batch.stageData?.label?.bestBefore ?? '—' }}</div>
        </div>
      </div>

      <!-- Phase-by-phase notes -->
      <div class="cs-phases">

        <!-- Brew day -->
        <div v-if="completionNotes.brew.length" class="cs-phase">
          <div class="cs-phase-title">Brew day</div>
          <div class="cs-rows">
            <div v-for="row in completionNotes.brew" :key="row.label" class="cs-row">
              <span class="cs-row-label">{{ row.label }}</span>
              <span class="cs-row-val">{{ row.value }}</span>
            </div>
          </div>
        </div>

        <!-- Fermentation -->
        <div v-if="completionNotes.ferment.length" class="cs-phase">
          <div class="cs-phase-title">Fermentation</div>
          <div class="cs-rows">
            <div v-for="row in completionNotes.ferment" :key="row.label" class="cs-row">
              <span class="cs-row-label">{{ row.label }}</span>
              <span class="cs-row-val">{{ row.value }}</span>
            </div>
          </div>
        </div>

        <!-- Conditioning -->
        <div v-if="completionNotes.condition.length" class="cs-phase">
          <div class="cs-phase-title">Secondary & conditioning</div>
          <div class="cs-rows">
            <div v-for="row in completionNotes.condition" :key="row.label" class="cs-row">
              <span class="cs-row-label">{{ row.label }}</span>
              <span class="cs-row-val">{{ row.value }}</span>
            </div>
          </div>
        </div>

        <!-- Canning day -->
        <div v-if="completionNotes.canning.length" class="cs-phase">
          <div class="cs-phase-title">Canning day</div>
          <div class="cs-rows">
            <div v-for="row in completionNotes.canning" :key="row.label" class="cs-row">
              <span class="cs-row-label">{{ row.label }}</span>
              <span class="cs-row-val">{{ row.value }}</span>
            </div>
          </div>
        </div>

        <!-- Post-production -->
        <div v-if="completionNotes.post.length" class="cs-phase">
          <div class="cs-phase-title">Post-production</div>
          <div class="cs-rows">
            <div v-for="row in completionNotes.post" :key="row.label" class="cs-row">
              <span class="cs-row-label">{{ row.label }}</span>
              <span class="cs-row-val">{{ row.value }}</span>
            </div>
          </div>
        </div>

        <!-- Corrective actions -->
        <div v-if="correctiveActions && correctiveActions.length" class="cs-phase cs-phase--ccp">
          <div class="cs-phase-title">Corrective actions</div>
          <div class="cs-rows">
            <div v-for="ca in correctiveActions" :key="ca.id" class="cs-row cs-row--ca">
              <span class="cs-row-label">{{ ca.ccp }}</span>
              <span class="cs-row-val">
                {{ ca.deviation }}
                <span v-if="ca.actionTaken"> · {{ ca.actionTaken }}</span>
                <span class="cs-ca-disposition" :class="`cs-ca--${ca.productDisposition}`">{{ ca.productDisposition }}</span>
              </span>
            </div>
          </div>
        </div>

      </div>

      </template>
    </div>

    <!-- Hold alert -->
    <div v-if="batch.status === 'hold' || hasOpenCorrectiveActions" class="alert-warn">
      <strong>Batch on hold</strong> — unresolved corrective action.
      <button class="alert-link" @click="openCorrectivePanel('')">
        View
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5h7M6 3l2.5 2.5L6 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>

    <!-- Quick stats strip -->
    <!-- Stage runner + help panel -->
    <div class="stage-layout">

      <div class="stage-runner-col">

        <!-- Phase groupings — hidden when batch is complete/disposed -->
        <template v-if="!batchLocked" v-for="phase in PHASES" :key="phase.key">
          <div
            class="phase-group"
            :class="[
              openPhase === phase.key ? 'phase-group--open' : '',
              stagesForPhase(phase.key).length === 1 ? 'phase-group--solo' : '',
            ]"
          >
            <!-- Section header (all phases — solo phases show the stage label, multi show the phase label) -->
            <button
              type="button"
              class="phase-header"
              :class="`phase-header--${phase.key}`"
              @click="togglePhase(phase.key)"
            >
              <span class="phase-icon" :class="`phase-icon--${phase.key}`">
                <!-- brew -->
                <svg v-if="phase.key === 'brew'" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 4h8l-.7 5.5A1.5 1.5 0 018.8 11H5.2a1.5 1.5 0 01-1.5-1.5L3 4z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
                  <path d="M5 4V3a2 2 0 014 0v1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                  <path d="M9.5 6.5c.8-.4 1.5 0 1.5.8s-.7 1.2-1.5.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                </svg>
                <!-- ferment -->
                <svg v-else-if="phase.key === 'ferment'" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2h4l.5 2H4.5L5 2z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
                  <rect x="3" y="4" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
                  <path d="M6 7.5c0-1 2-1 2 0s-2 1-2 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                </svg>
                <!-- condition -->
                <svg v-else-if="phase.key === 'condition'" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2c-1.5 2-3 3.5-3 5.5a3 3 0 006 0C10 5.5 8.5 4 7 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
                  <path d="M5.5 9.5c.5.7 3 .7 3 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                </svg>
                <!-- canning -->
                <svg v-else-if="phase.key === 'canning'" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="3.5" y="2" width="7" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
                  <path d="M3.5 5h7M3.5 9h7" stroke="currentColor" stroke-width="1.1"/>
                </svg>
                <!-- post -->
                <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="4" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
                  <path d="M4.5 4V3a2.5 2.5 0 015 0v1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                  <path d="M5 8l1.5 1.5L9 7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <!-- Solo: show the single stage's label. Multi: show the phase label -->
              <span class="phase-title">
                <template v-if="stagesForPhase(phase.key).length === 1">{{ stagesForPhase(phase.key)[0].label }}</template>
                <template v-else>{{ phase.label }}</template>
              </span>
              <span v-if="phaseComplete(phase.key)" class="phase-done-badge">Done</span>
              <span style="flex:1" />
              <svg class="phase-chevron" :class="{ 'phase-chevron--open': openPhase === phase.key }" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 5.5l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <!-- Completed: always show summary stats (above stage rows when open) -->
            <div
              v-if="phaseComplete(phase.key) && phaseSummary(phase.key).length"
              class="phase-summary"
              :class="{ 'phase-summary--with-stages': openPhase === phase.key }"
            >
              <div v-for="stat in phaseSummary(phase.key)" :key="stat.label" class="phase-stat">
                <span class="phase-stat-label">{{ stat.label }}</span>
                <span class="phase-stat-value">{{ stat.value }}</span>
              </div>
            </div>

            <!-- Stage rows — shown when phase is open -->
            <div
              v-if="openPhase === phase.key"
              class="stage-runner"
            >
          <div
            v-for="stage in stagesForPhase(phase.key)"
            :key="stage.n"
            class="stage-row"
            :class="[
              `stage-row--${stageStatus(stage.n)}`,
              { 'stage-row--open': openStage === stage.n },
              { 'stage-row--ccp': stage.ccp },
            ]"
          >
            <!-- Stage header (always visible) -->
            <button
              class="stage-summary"
              type="button"
              :disabled="stageStatus(stage.n) === 'locked'"
              @click="toggleStage(stage.n)"
            >
              <div class="stage-num" :class="`num--${stageStatus(stage.n)}`">
                <svg v-if="stageStatus(stage.n) === 'done'" width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2.5L8 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span v-else>{{ stage.n }}</span>
              </div>
              <div class="stage-info">
                <div class="stage-label-row">
                  <span class="stage-label">{{ stage.label }}</span>
                  <span v-if="stage.ccp" class="ccp-badge">CCP</span>
                </div>
                <div v-if="stageSummary(stage)" class="stage-done-summary">{{ stageSummary(stage) }}</div>
              </div>
              <div class="stage-right">
                <span v-if="stageStatus(stage.n) === 'next'" class="stage-next-pill">Next</span>
                <svg class="stage-chevron" :class="{ 'chevron--open': openStage === stage.n }" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M4 5.5l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </button>

            <!-- Expanded panel -->
            <div v-if="openStage === stage.n" class="stage-panel">

              <!-- Locked notice for completed stages -->
              <div v-if="stageStatus(stage.n) === 'done'" class="stage-locked-notice">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 5.5l2.5 3L10 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Stage completed · {{ formatStageDate(stage.key) }}
              </div>

              <!-- Form content — hidden when stage done or batch locked -->
              <div v-if="stageStatus(stage.n) !== 'done' && !batchLocked">

              <!-- ── 1 · Sanitise ── -->
              <template v-if="stage.key === 'sanitise'">
                <div class="panel-body">
                  <p class="panel-lead">Check off each item as you sanitise it. Use food-grade sanitiser on everything that touches the wort.</p>
                  <div class="checklist">
                    <label v-for="item in EQUIPMENT_CHECKLIST" :key="item" class="checklist-item">
                      <input v-model="forms.sanitise.checked" type="checkbox" :value="item" />
                      <span>{{ item }}</span>
                    </label>
                  </div>
                  <div class="field" style="margin-top:12px">
                    <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                    <textarea v-model="forms.sanitise.notes" class="field-input field-textarea" rows="2" placeholder="Sanitiser brand/concentration, any items replaced…" />
                  </div>
                  <div v-if="forms.sanitise.checked.length < EQUIPMENT_CHECKLIST.length" class="panel-hint">
                    {{ EQUIPMENT_CHECKLIST.length - forms.sanitise.checked.length }} items remaining
                  </div>
                  <div class="panel-actions">
                    <button type="button" class="btn-submit" :disabled="saving === stage.key" @click="saveStageClick(stage)">
                      <template v-if="saving === stage.key">Saving…</template>
                      <template v-else>All sanitised <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                    </button>
                  </div>
                </div>
              </template>

              <!-- ── 2 · Ingredients check ── -->
              <template v-else-if="stage.key === 'ingredients'">
                <div class="panel-body">
                  <p class="panel-lead">Weigh out your ingredients. Recipe amounts shown as targets — enter what you actually used.</p>
                  <div v-if="linkedProduct && linkedProduct.recipe.length" class="recipe-ref">
                    <div v-for="ri in linkedProduct.recipe" :key="ri.ingredientId" class="recipe-ref-row">
                      <span class="recipe-ref-label">{{ ri.ingredientName }}</span>
                      <input
                        v-model.number="ingredientActuals[ri.ingredientId]"
                        type="number"
                        class="field-input meas-input"
                        min="0"
                        step="0.1"
                        :placeholder="String(ri.amountPerBatch)"
                      />
                      <span class="meas-unit">{{ ri.unit }}</span>
                    </div>
                  </div>
                  <div v-else class="info-notice" style="margin-bottom:12px">
                    No recipe linked to this product yet. Add ingredients to the product in the Products page.
                  </div>
                  <div class="field" style="margin-top:12px">
                    <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                    <textarea v-model="forms.ingredients.notes" class="field-input field-textarea" rows="2" placeholder="Supplier, lot numbers, any quality concerns…" />
                  </div>
                  <div class="panel-actions">
                    <button type="button" class="btn-submit" :disabled="saving === stage.key" @click="saveStageClick(stage)">
                      <template v-if="saving === stage.key">Saving…</template>
                      <template v-else>Ingredients confirmed <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                    </button>
                  </div>
                </div>
              </template>

              <!-- ── 3 · Brew the tea ── -->
              <template v-else-if="stage.key === 'brew'">
                <div class="panel-body">
                  <p class="panel-lead">Heat brew water to 90–95°C, steep tea for 15–30 min, then remove leaves.</p>
                  <div class="recipe-ref">
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">Brew temp reached</span>
                      <input v-model.number="forms.brew.brewTempC" type="number" class="field-input meas-input" step="0.5" min="50" max="100" />
                      <span class="meas-unit">°C</span>
                    </div>
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">Steep time</span>
                      <input v-model.number="forms.brew.steepMinutes" type="number" class="field-input meas-input" step="1" min="5" max="120" />
                      <span class="meas-unit">min</span>
                    </div>
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">Tea volume produced</span>
                      <input v-model.number="forms.brew.brewVolumeL" type="number" class="field-input meas-input" step="0.5" min="0" max="200" />
                      <span class="meas-unit">L</span>
                    </div>
                  </div>
                  <div class="field" style="margin-top:12px">
                    <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                    <textarea v-model="forms.brew.notes" class="field-input field-textarea" rows="2" placeholder="Colour, aroma, any observations…" />
                  </div>
                  <div class="panel-actions">
                    <button type="button" class="btn-submit" :disabled="saving === stage.key" @click="saveStageClick(stage)">
                      <template v-if="saving === stage.key">Saving…</template>
                      <template v-else>Tea brewed <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                    </button>
                  </div>
                </div>
              </template>

              <!-- ── 4 · Dissolve sugar ── -->
              <template v-else-if="stage.key === 'sweeten'">
                <div class="panel-body">
                  <p class="panel-lead">Add sugar while the tea is still hot (above 70°C — it dissolves much more easily). Stir until no crystals remain.</p>
                  <div class="recipe-ref">
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">Wort temp when sugar added</span>
                      <input v-model.number="forms.sweeten.wortTempAfterSugarC" type="number" class="field-input meas-input" step="0.5" min="0" max="100" />
                      <span class="meas-unit">°C</span>
                    </div>
                    <div class="recipe-ref-row checklist-row">
                      <span class="recipe-ref-label">Fully dissolved?</span>
                      <label class="inline-check">
                        <input v-model="forms.sweeten.sugarDissolvedConfirmed" type="checkbox" />
                        <span>Confirmed — no visible crystals</span>
                      </label>
                    </div>
                  </div>
                  <div class="field" style="margin-top:12px">
                    <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                    <textarea v-model="forms.sweeten.notes" class="field-input field-textarea" rows="2" placeholder="Any observations…" />
                  </div>
                  <div class="panel-actions">
                    <button type="button" class="btn-submit" :disabled="saving === stage.key || !forms.sweeten.sugarDissolvedConfirmed" @click="saveStageClick(stage)">
                      <template v-if="saving === stage.key">Saving…</template>
                      <template v-else>Sugar dissolved <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                    </button>
                  </div>
                </div>
              </template>

              <!-- ── 5 · Measure OG ── -->
              <template v-else-if="stage.key === 'og'">
                <div class="panel-body">
                  <p class="panel-lead">Take a hydrometer reading while the wort is still hot. This is your original gravity — it determines the final ABV.</p>
                  <div class="recipe-ref">
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">Original gravity (OG)</span>
                      <input v-model.number="forms.og.ogRecorded" type="number" class="field-input meas-input" step="0.001" min="1.000" max="1.150" />
                      <span class="meas-unit">SG</span>
                    </div>
                  </div>
                  <div class="field" style="margin-top:12px">
                    <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                    <textarea v-model="forms.og.notes" class="field-input field-textarea" rows="2" placeholder="Sample temperature, any observations…" />
                  </div>
                  <div class="panel-actions">
                    <button type="button" class="btn-submit" :disabled="saving === stage.key || !forms.og.ogRecorded" @click="saveStageClick(stage)">
                      <template v-if="saving === stage.key">Saving…</template>
                      <template v-else>OG recorded <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                    </button>
                  </div>
                </div>
              </template>

              <!-- ── 6 · Cool to pitch temp ── -->
              <template v-else-if="stage.key === 'cool'">
                <div class="panel-body">
                  <div class="crit-limit">Do not pitch yeast above 25°C — heat kills it. Target 18–22°C.</div>
                  <div class="recipe-ref" style="margin-top:12px">
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">Final temp</span>
                      <input v-model.number="forms.cool.finalTempC" type="number" class="field-input meas-input" step="0.5" min="0" max="40" />
                      <span class="meas-unit">°C</span>
                    </div>
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">Cold water added</span>
                      <input v-model.number="forms.cool.waterAddedL" type="number" class="field-input meas-input" step="0.5" min="0" max="200" />
                      <span class="meas-unit">L</span>
                    </div>
                  </div>
                  <div v-if="forms.cool.finalTempC && forms.cool.finalTempC > 25" class="field-warn" style="margin-top:10px">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="vertical-align:-2px;flex-shrink:0"><path d="M6.5 2L12 11H1L6.5 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M6.5 5.5v2.5M6.5 9.5v.3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                    Temperature is above 25°C — cool further before pitching.
                  </div>
                  <div v-if="forms.cool.finalTempC && forms.cool.finalTempC >= 18 && forms.cool.finalTempC <= 22" class="field-ok" style="margin-top:10px">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="vertical-align:-2px;flex-shrink:0"><path d="M2 6.5l3 3L11 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    In range for pitching
                  </div>
                  <div class="field" style="margin-top:12px">
                    <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                    <textarea v-model="forms.cool.notes" class="field-input field-textarea" rows="2" placeholder="Any observations…" />
                  </div>
                  <div class="panel-actions">
                    <button type="button" class="btn-submit" :disabled="saving === stage.key || (forms.cool.finalTempC != null && forms.cool.finalTempC > 25)" @click="saveStageClick(stage)">
                      <template v-if="saving === stage.key">Saving…</template>
                      <template v-else>Cooled <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                    </button>
                  </div>
                </div>
              </template>

              <!-- ── 6 · Pitch yeast ── -->
              <template v-else-if="stage.key === 'pitch'">
                <div class="panel-body">
                  <p class="panel-lead">Rehydrate dry yeast in 30–35°C water for 15 min before pitching. Add yeast nutrients, then pitch. Fit the airlock immediately.</p>
                  <div class="recipe-ref">
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">Pitching temp</span>
                      <input v-model.number="forms.pitch.pitchTempC" type="number" class="field-input meas-input" step="0.5" min="10" max="35" />
                      <span class="meas-unit">°C</span>
                    </div>
                    <div class="recipe-ref-row checklist-row">
                      <span class="recipe-ref-label">Yeast rehydrated?</span>
                      <label class="inline-check">
                        <input v-model="forms.pitch.yeastHydrated" type="checkbox" />
                        <span>Yes — 15 min in 30–35°C water</span>
                      </label>
                    </div>
                  </div>
                  <div class="field" style="margin-top:12px">
                    <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                    <textarea v-model="forms.pitch.notes" class="field-input field-textarea" rows="2" placeholder="Yeast brand, any observations…" />
                  </div>
                  <div class="panel-actions">
                    <button type="button" class="btn-submit" :disabled="saving === stage.key" @click="saveStageClick(stage)">
                      <template v-if="saving === stage.key">Saving…</template>
                      <template v-else>Yeast pitched <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                    </button>
                  </div>
                </div>
              </template>

              <!-- ── 7 · Fermentation ── -->
              <template v-else-if="stage.key === 'ferment'">
                <div class="panel-body">
                  <div v-if="readings?.length" class="readings-table-wrap">
                    <table class="readings-table">
                      <thead>
                        <tr><th>Day</th><th>SG</th><th>Temp</th><th>Notes</th></tr>
                      </thead>
                      <tbody>
                        <tr v-for="day in [...new Set(readings.map(r => r.day))].sort((a,b)=>a-b)" :key="day">
                          <td class="mono">{{ day }}</td>
                          <td class="mono">{{ readings.find(r => r.day === day && r.type === 'gravity')?.value?.toFixed(3) ?? '—' }}</td>
                          <td class="mono">{{ readings.find(r => r.day === day && r.type === 'temperature') ? readings.find(r => r.day === day && r.type === 'temperature')!.value + '°C' : '—' }}</td>
                          <td class="readings-notes">{{ readings.find(r => r.day === day && r.type === 'gravity')?.notes || readings.find(r => r.day === day && r.type === 'temperature')?.notes || '' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p v-else class="panel-empty">No readings logged yet — log your first SG reading today.</p>
                  <div v-if="fermentStable" class="stability-alert--ok">
                    SG stable over ≥48 h — fermentation likely complete. Ready to transfer.
                  </div>
                </div>
                <div class="ferment-actions">
                  <button type="button" class="btn-submit" @click="logPanelOpen = true">+ Log reading</button>
                  <button type="button" class="btn-add-ingredient" @click="fermentAddOpen = true">+ Add ingredient</button>
                  <button type="button" class="btn-mark-complete" @click="fermentCompleteDialogOpen = true">
                    <template v-if="saving === stage.key">Saving…</template>
                    <template v-else>Mark complete <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style="vertical-align:-1px"><path d="M2 5.5h7M6 3l2.5 2.5L6 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                  </button>
                </div>
              </template>

              <!-- ── 8 · Transfer to secondary ── -->
              <template v-else-if="stage.key === 'secondary'">
                <div class="panel-body">
                  <div class="transfer-dest">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Transferring to Fermenter {{ batch.fermenter === 'A' ? 'B' : 'A' }}
                  </div>
                  <p class="panel-lead">Siphon from primary — leave the yeast cake behind. Sanitise the secondary vessel before transfer.</p>
                  <div class="recipe-ref">
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">Volume transferred</span>
                      <input v-model.number="forms.secondary.volumeTransferredL" type="number" class="field-input meas-input" step="0.1" min="0" max="500" placeholder="20" />
                      <span class="meas-unit">L</span>
                    </div>
                  </div>
                  <div class="field" style="margin-top:12px">
                    <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                    <textarea v-model="forms.secondary.notes" class="field-input field-textarea" rows="2" placeholder="Clarity, yeast cake condition, observations…" />
                  </div>
                  <div class="panel-actions">
                    <button type="button" class="btn-submit" :disabled="saving === stage.key" @click="saveStageClick(stage)">
                      <template v-if="saving === stage.key">Saving…</template>
                      <template v-else>Move to Fermenter {{ batch.fermenter === 'A' ? 'B' : 'A' }} <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                    </button>
                  </div>
                </div>
              </template>

              <!-- ── 9 · Conditioning ingredients ── -->
              <template v-else-if="stage.key === 'condition'">
                <div class="panel-body">
                  <p class="panel-lead">Add conditioning ingredients. Recipe amounts shown as targets — enter what you actually used.</p>
                  <div v-if="linkedProduct && linkedProduct.conditioning && linkedProduct.conditioning.length" class="recipe-ref">
                    <div v-for="ri in linkedProduct.conditioning" :key="ri.ingredientId" class="recipe-ref-row">
                      <span class="recipe-ref-label">{{ ri.ingredientName }}</span>
                      <input
                        v-model.number="conditioningActuals[ri.ingredientId]"
                        type="number"
                        class="field-input meas-input"
                        min="0"
                        step="0.1"
                        :placeholder="String(ri.amountPerBatch)"
                      />
                      <span class="meas-unit">{{ ri.unit }}</span>
                    </div>
                  </div>
                  <div v-else class="info-notice" style="margin-bottom:12px">
                    No conditioning additions defined for this product. Add them in the <NuxtLink to="/products" class="recipe-link">Products page</NuxtLink>.
                  </div>
                  <div class="field" style="margin-top:12px">
                    <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                    <textarea v-model="forms.condition.notes" class="field-input field-textarea" rows="2" placeholder="Any observations…" />
                  </div>
                  <div class="panel-actions">
                    <button type="button" class="btn-submit" :disabled="saving === stage.key" @click="saveStageClick(stage)">
                      <template v-if="saving === stage.key">Saving…</template>
                      <template v-else>Conditioning confirmed <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                    </button>
                  </div>
                </div>
              </template>

              <!-- ── 10 · Fermentation arrest ── -->
              <template v-else-if="stage.key === 'arrest'">
                <div class="panel-body">
                  <p class="panel-lead">Confirm fermentation has fully stopped. Take a gravity reading and compare to the previous one — stability over ≥24 h means it's done.</p>
                  <div v-if="fermentStable" class="stability-alert--ok">Gravity readings confirm fermentation has arrested.</div>
                  <div class="field" style="margin-top:12px">
                    <label class="field-label">Notes</label>
                    <textarea v-model="forms.arrest.notes" class="field-input field-textarea" rows="2" placeholder="Final SG, stability observations, time since last reading…" />
                  </div>
                  <div class="panel-actions">
                    <button type="button" class="btn-submit" :disabled="saving === stage.key" @click="saveStageClick(stage)">
                      <template v-if="saving === stage.key">Saving…</template>
                      <template v-else>Fermentation arrested <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                    </button>
                  </div>
                </div>
              </template>

              <!-- ── 11 · CCP1 — pH ── -->
              <template v-else-if="stage.key === 'ccp1'">
                <div class="panel-body">
                  <div class="crit-limit">Critical limit: pH ≤ 4.6. Calibrate meter before measuring.</div>
                  <div class="recipe-ref" style="margin-top:12px">
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">pH reading</span>
                      <input v-model.number="forms.ccp1.ph" type="number" class="field-input meas-input" step="0.01" min="0" max="14" />
                      <span class="meas-unit" />
                    </div>
                  </div>
                  <div v-if="forms.ccp1.ph != null" class="ccp-live-result" :class="forms.ccp1.ph <= 4.6 ? 'result-pass' : 'result-fail'">
                    <span v-if="forms.ccp1.ph <= 4.6">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="vertical-align:-2px;flex-shrink:0"><path d="M2 6.5l3 3L11 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      In limit — proceed to canning
                    </span>
                    <span v-else>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="vertical-align:-2px;flex-shrink:0"><path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                      Over limit — do not proceed. Raise a corrective action.
                    </span>
                  </div>
                  <div class="field" style="margin-top:12px">
                    <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                    <textarea v-model="forms.ccp1.notes" class="field-input field-textarea" rows="2" placeholder="Meter calibration, sample location, observations…" />
                  </div>
                  <div class="panel-actions">
                    <button type="button" class="btn-submit" :disabled="saving === stage.key || forms.ccp1.ph == null" @click="saveStageClick(stage)">
                      <template v-if="saving === stage.key">Saving…</template>
                      <template v-else>Record CCP1 <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                    </button>
                    <button v-if="forms.ccp1.ph != null && forms.ccp1.ph > 4.6" class="btn-cancel corrective-link" @click="openCorrectivePanel('CCP1')">
                      Raise corrective action
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style="vertical-align:-1px"><path d="M2 5.5h7M6 3l2.5 2.5L6 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                  </div>
                </div>
              </template>

              <!-- ── 12 · Pre-can quality check ── -->
              <template v-else-if="stage.key === 'precan'">
                <div class="panel-body">
                  <p class="panel-lead">Final sensory check before product enters a can.</p>
                  <div class="recipe-ref">
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">pH (re-check)</span>
                      <input v-model.number="forms.precan.precanPh" type="number" class="field-input meas-input" step="0.01" min="0" max="14" />
                      <span class="meas-unit" />
                    </div>
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">Clarity</span>
                      <select v-model="forms.precan.precanClarity" class="field-input meas-input" style="width:140px">
                        <option value="">Select…</option>
                        <option>Clear</option>
                        <option>Slightly hazy</option>
                        <option>Hazy</option>
                        <option>Cloudy</option>
                      </select>
                      <span class="meas-unit" />
                    </div>
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">Carbonation</span>
                      <select v-model="forms.precan.precanCarbonation" class="field-input meas-input" style="width:140px">
                        <option value="">Select…</option>
                        <option>Flat</option>
                        <option>Low</option>
                        <option>Good</option>
                        <option>Over-carbonated</option>
                      </select>
                      <span class="meas-unit" />
                    </div>
                  </div>
                  <div class="field" style="margin-top:12px">
                    <label class="field-label">Taste notes</label>
                    <textarea v-model="forms.precan.precanTaste" class="field-input field-textarea" rows="2" placeholder="Acidity, sweetness, flavour balance, off-flavours…" />
                  </div>
                  <div class="field">
                    <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                    <textarea v-model="forms.precan.notes" class="field-input field-textarea" rows="2" placeholder="QC pass/fail, any concerns…" />
                  </div>
                  <div class="panel-actions">
                    <button type="button" class="btn-submit" :disabled="saving === stage.key" @click="saveStageClick(stage)">
                      <template v-if="saving === stage.key">Saving…</template>
                      <template v-else>QC passed <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                    </button>
                  </div>
                </div>
              </template>

              <!-- ── 13 · Canning run ── -->
              <template v-else-if="stage.key === 'canning'">
                <div class="panel-body">

                  <!-- Volume allowance bar -->
                  <div v-if="volumeAllowanceMl" class="can-allowance">
                    <div class="can-allowance-header">
                      <span class="can-allowance-label">Volume used</span>
                      <span class="can-allowance-value">
                        {{ (canRunsTotalMl / 1000).toFixed(1) }} L
                        <span class="can-allowance-of">of {{ (volumeAllowanceMl / 1000).toFixed(1) }} L</span>
                      </span>
                    </div>
                    <div class="can-allowance-bar">
                      <div
                        class="can-allowance-fill"
                        :class="{ 'can-allowance-fill--over': canRunsTotalMl > volumeAllowanceMl }"
                        :style="{ width: Math.min(100, (canRunsTotalMl / volumeAllowanceMl) * 100) + '%' }"
                      />
                    </div>
                    <p v-if="canRunsTotalMl > volumeAllowanceMl" class="can-allowance-warn">
                      Exceeds transferred volume — check your figures.
                    </p>
                  </div>

                  <!-- Can runs table -->
                  <div class="can-runs">
                    <div class="can-runs-header">
                      <span>Size</span>
                      <span>Qty</span>
                      <span>Type</span>
                      <span />
                    </div>
                    <div v-for="(run, i) in canRuns" :key="i" class="can-run-row">
                      <select v-model.number="run.sizeMl" class="field-input">
                        <option :value="250">250 ml</option>
                        <option :value="300">300 ml</option>
                        <option :value="330">330 ml</option>
                        <option :value="440">440 ml</option>
                        <option :value="500">500 ml</option>
                      </select>
                      <input v-model.number="run.qty" type="number" class="field-input" min="1" step="1" placeholder="0" />
                      <div class="can-run-toggle">
                        <button type="button" class="can-run-toggle-btn" :class="{ active: !run.defect }" @click="run.defect = false">Good</button>
                        <button type="button" class="can-run-toggle-btn can-run-toggle-btn--defect" :class="{ active: run.defect }" @click="run.defect = true">Defect</button>
                      </div>
                      <button type="button" class="can-run-remove" @click="removeCanRun(i)" :disabled="canRuns.length === 1" aria-label="Remove row">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
                      </button>
                    </div>
                    <button type="button" class="btn-add-row" @click="addCanRun()">+ Add row</button>
                  </div>

                  <!-- Totals -->
                  <div class="can-totals">
                    <span>{{ canRunsGoodCans }} good · {{ canRunsDefectCans }} defect · {{ canRunsGoodCans + canRunsDefectCans }} total cans</span>
                  </div>

                  <div class="field" style="margin-top:12px">
                    <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                    <textarea v-model="forms.canning.notes" class="field-input field-textarea" rows="2" placeholder="Incidents, interruptions, lot code range…" />
                  </div>
                  <div class="panel-actions">
                    <button type="button" class="btn-submit" :disabled="saving === stage.key || canRunsGoodCans === 0" @click="saveStageClick(stage)">
                      <template v-if="saving === stage.key">Saving…</template>
                      <template v-else>Canning recorded <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                    </button>
                  </div>
                </div>
              </template>

              <!-- ── 14 · CCP3 — O₂ purge ── -->
              <template v-else-if="stage.key === 'ccp3'">
                <div class="panel-body">
                  <div class="crit-limit">Critical limit: Food-grade CO₂ or N₂ purge applied to every can before filling. DO ≤ 0.3 mg/L if measured.</div>
                  <div class="recipe-ref" style="margin-top:12px">
                    <div class="recipe-ref-row checklist-row">
                      <span class="recipe-ref-label">Purge applied?</span>
                      <label class="inline-check">
                        <input v-model="forms.ccp3.purgeConfirmed" type="checkbox" />
                        <span>Yes — applied to every can</span>
                      </label>
                    </div>
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">Gas type</span>
                      <select v-model="forms.ccp3.gasType" class="field-input meas-input" style="width:80px">
                        <option value="">…</option>
                        <option value="CO2">CO₂</option>
                        <option value="N2">N₂</option>
                      </select>
                      <span class="meas-unit" />
                    </div>
                  </div>
                  <div v-if="!forms.ccp3.purgeConfirmed && forms.ccp3.purgeConfirmed !== undefined" class="ccp-live-result result-fail">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="vertical-align:-2px;flex-shrink:0"><path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                    Purge not confirmed — do not fill. Raise a corrective action.
                  </div>
                  <div class="field" style="margin-top:12px">
                    <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                    <textarea v-model="forms.ccp3.notes" class="field-input field-textarea" rows="2" />
                  </div>
                  <div class="panel-actions">
                    <button type="button" class="btn-submit" :disabled="saving === stage.key || !forms.ccp3.purgeConfirmed" @click="saveStageClick(stage)">
                      <template v-if="saving === stage.key">Saving…</template>
                      <template v-else>CCP3 recorded <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                    </button>
                  </div>
                </div>
              </template>

              <!-- ── 15 · CCP4 — Seam integrity ── -->
              <template v-else-if="stage.key === 'ccp4'">
                <div class="panel-body">
                  <div class="crit-limit">Critical limits: Visual pass · seam dimensions in tolerance · leak test pass · no metal fragments.</div>
                  <div class="recipe-ref" style="margin-top:12px">
                    <div class="recipe-ref-row checklist-row">
                      <span class="recipe-ref-label">Visual seam inspection</span>
                      <div class="inline-radio">
                        <label><input v-model="forms.ccp4.seamVisualPass" type="radio" :value="true" /> Pass</label>
                        <label><input v-model="forms.ccp4.seamVisualPass" type="radio" :value="false" /> Fail</label>
                      </div>
                    </div>
                    <div class="recipe-ref-row checklist-row">
                      <span class="recipe-ref-label">Leak test</span>
                      <div class="inline-radio">
                        <label><input v-model="forms.ccp4.leakTestPass" type="radio" :value="true" /> Pass</label>
                        <label><input v-model="forms.ccp4.leakTestPass" type="radio" :value="false" /> Fail</label>
                      </div>
                    </div>
                    <div class="recipe-ref-row checklist-row">
                      <span class="recipe-ref-label">Metal fragments</span>
                      <div class="inline-radio">
                        <label><input v-model="forms.ccp4.metalFragmentsNone" type="radio" :value="true" /> None found</label>
                        <label><input v-model="forms.ccp4.metalFragmentsNone" type="radio" :value="false" /> Found</label>
                      </div>
                    </div>
                  </div>
                  <div v-if="forms.ccp4.metalFragmentsNone === false" class="ccp-live-result result-fail">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="vertical-align:-2px;flex-shrink:0"><path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                    Metal fragments found — quarantine the full batch immediately.
                  </div>
                  <div class="field" style="margin-top:12px">
                    <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                    <textarea v-model="forms.ccp4.notes" class="field-input field-textarea" rows="2" />
                  </div>
                  <div class="panel-actions">
                    <button type="button" class="btn-submit" :disabled="saving === stage.key || forms.ccp4.seamVisualPass == null" @click="saveStageClick(stage)">
                      <template v-if="saving === stage.key">Saving…</template>
                      <template v-else>CCP4 recorded <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                    </button>
                  </div>
                </div>
              </template>

              <!-- ── 16 · CCP2 — Pasteurisation ── -->
              <template v-else-if="stage.key === 'ccp2'">
                <div class="panel-body">
                  <div class="crit-limit">Critical limits: Water bath ≥ 75°C throughout · hold time ≥ 10 minutes.</div>
                  <div class="recipe-ref" style="margin-top:12px">
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">Water bath temp</span>
                      <input v-model.number="forms.ccp2.waterBathTempC" type="number" class="field-input meas-input" step="0.5" min="50" max="100" />
                      <span class="meas-unit">°C</span>
                    </div>
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">Hold time</span>
                      <input v-model.number="forms.ccp2.holdTimeMinutes" type="number" class="field-input meas-input" step="1" min="1" max="120" />
                      <span class="meas-unit">min</span>
                    </div>
                  </div>
                  <div v-if="ccp2LiveResult !== null" class="ccp-live-result" :class="ccp2LiveResult === 'pass' ? 'result-pass' : 'result-fail'">
                    <span v-if="ccp2LiveResult === 'pass'">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="vertical-align:-2px;flex-shrink:0"><path d="M2 6.5l3 3L11 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      Limits met — pasteurisation complete
                    </span>
                    <span v-else>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="vertical-align:-2px;flex-shrink:0"><path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                      Limits not met — do not release product
                    </span>
                  </div>
                  <div class="field" style="margin-top:12px">
                    <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                    <textarea v-model="forms.ccp2.notes" class="field-input field-textarea" rows="2" />
                  </div>
                  <div class="panel-actions">
                    <button type="button" class="btn-submit" :disabled="saving === stage.key || forms.ccp2.waterBathTempC == null" @click="saveStageClick(stage)">
                      <template v-if="saving === stage.key">Saving…</template>
                      <template v-else>CCP2 recorded <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                    </button>
                    <button v-if="ccp2LiveResult === 'fail'" class="btn-cancel corrective-link" @click="openCorrectivePanel('CCP2')">
                      Raise corrective action
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style="vertical-align:-1px"><path d="M2 5.5h7M6 3l2.5 2.5L6 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                  </div>
                </div>
              </template>

              <!-- ── 17 · Can inspection ── -->
              <template v-else-if="stage.key === 'inspect'">
                <div class="panel-body">
                  <p class="panel-lead">Visually inspect all cans after pasteurisation. Remove any swollen, leaking, or damaged cans.</p>
                  <div class="recipe-ref">
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">Cans inspected</span>
                      <input v-model.number="forms.inspect.cansInspected" type="number" class="field-input meas-input" min="0" step="1" placeholder="500" />
                      <span class="meas-unit" />
                    </div>
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">Defects found</span>
                      <input v-model.number="forms.inspect.defectsFound" type="number" class="field-input meas-input" min="0" step="1" />
                      <span class="meas-unit" />
                    </div>
                  </div>
                  <div class="field" style="margin-top:12px">
                    <label class="field-label">Notes</label>
                    <textarea v-model="forms.inspect.notes" class="field-input field-textarea" rows="2" placeholder="Defect description, disposition of rejected cans…" />
                  </div>
                  <div class="panel-actions">
                    <button type="button" class="btn-submit" :disabled="saving === stage.key" @click="saveStageClick(stage)">
                      <template v-if="saving === stage.key">Saving…</template>
                      <template v-else>Inspection complete <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                    </button>
                  </div>
                </div>
              </template>

              <!-- ── 18 · Labelling & storage ── -->
              <template v-else-if="stage.key === 'label'">
                <div class="panel-body">
                  <div class="label-reminder">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style="flex-shrink:0"><path d="M7.5 1.5L9.2 5l3.8.55-2.75 2.68.65 3.77L7.5 10.1l-3.4 1.9.65-3.77L2 5.55 5.8 5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
                    <div>
                      <p class="label-reminder-title">Apply label to every can</p>
                      <p class="label-reminder-desc">Include batch number <strong>{{ batch?.batchId }}</strong> and best-before date on each can for traceability.</p>
                    </div>
                  </div>
                  <div class="recipe-ref" style="margin-top:12px">
                    <div class="recipe-ref-row">
                      <span class="recipe-ref-label">Best before</span>
                      <input v-model="forms.label.bestBefore" type="date" class="field-input meas-input" style="width:140px" />
                      <span class="meas-unit" />
                    </div>
                  </div>
                  <div class="field" style="margin-top:12px">
                    <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                    <textarea v-model="forms.label.notes" class="field-input field-textarea" rows="2" placeholder="Labels applied, lot code confirmed, any remarks…" />
                  </div>
                  <div class="panel-actions">
                    <button type="button" class="btn-submit" :disabled="saving === stage.key" @click="saveStageClick(stage)">
                      <template v-if="saving === stage.key">Saving…</template>
                      <template v-else>Labelled & stored <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
                    </button>
                  </div>
                </div>
              </template>


              </div><!-- end v-if not done -->

            </div><!-- end .stage-panel -->
          </div><!-- end .stage-row -->
            </div><!-- end .stage-runner -->
          </div><!-- end .phase-group -->
        </template><!-- end phase loop -->

      </div><!-- end .stage-runner-col -->

      <!-- Sidebar: stats + help — hidden when batch is locked -->
      <aside v-if="!batchLocked" class="help-panel" aria-label="Batch info and stage guidance">

        <!-- Stats card -->
        <div class="stats-card form-card">
          <div class="stats-card-row">
            <div class="stat-item">
              <div class="stat-label">OG</div>
              <div class="stat-val">{{ ogDisplay }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Latest SG</div>
              <div class="stat-val">{{ latestSG ?? '—' }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Target FG</div>
              <div class="stat-val">1.000</div>
            </div>
          </div>
          <div class="stats-sep" />
          <div class="stats-card-row">
            <div class="stat-item">
              <div class="stat-label">Est. ABV</div>
              <div class="stat-val">{{ estimatedAbv ?? '—' }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Current ABV</div>
              <div class="stat-val">{{ currentAbv ?? '—' }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Total vol</div>
              <div class="stat-val">{{ totalVolumeL != null ? `${totalVolumeL} L` : '—' }}</div>
            </div>
          </div>
        </div>

        <!-- Help card -->
        <div v-if="activeHelp" class="help-card">
          <div class="help-stage-label">
            <span class="help-stage-num">{{ activeHelp.n }}</span>
            <span class="help-stage-title">{{ activeHelp.title }}</span>
          </div>
          <div v-if="activeHelp.what" class="help-section">
            <p class="help-section-heading">What to do</p>
            <ul class="help-list">
              <li v-for="item in activeHelp.what" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div v-if="activeHelp.check" class="help-section">
            <p class="help-section-heading">What to check</p>
            <ul class="help-list help-list--check">
              <li v-for="item in activeHelp.check" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div v-if="activeHelp.next" class="help-section">
            <p class="help-section-heading">Coming up</p>
            <p class="help-next-text">{{ activeHelp.next }}</p>
          </div>
          <div v-if="activeHelp.critical" class="help-critical">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2.5v4M6 8.5v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M6 1L11.5 10.5H0.5L6 1z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>
            {{ activeHelp.critical }}
          </div>
        </div>
        <div v-if="!activeHelp" class="help-empty">
          <div class="help-empty-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" stroke="currentColor" stroke-width="1.2" opacity=".25"/><path d="M14 9v5.5M14 17.5v.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </div>
          <p class="help-empty-text">Open a step to see tips and what to check</p>
        </div>
      </aside>

    </div><!-- end .stage-layout -->

  </div>
  <div v-else class="loading-state">Loading batch…</div>

  <!-- Corrective action drawer -->
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="correctivePanelOpen" class="overlay" @click.self="correctivePanelOpen = false">
        <Transition name="panel">
          <div v-if="correctivePanelOpen" class="form-panel">
            <div class="panel-header">
              <div>
                <p class="panel-eyebrow">{{ batch?.batchId }}</p>
                <h2 class="panel-title">Corrective action</h2>
              </div>
              <button class="panel-close" @click="correctivePanelOpen = false" aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <!-- Open actions list -->
            <div v-if="openActions.length" class="panel-open-actions">
              <div v-for="action in openActions" :key="action.id" class="open-action-card">
                <div class="open-action-head">
                  <span class="open-action-ccp">{{ action.ccp }}</span>
                  <span class="open-action-date">{{ formatCorrectiveDate(action.raisedAt) }}</span>
                  <span v-if="!action.resolvedAt" class="result warn">Unresolved</span>
                </div>
                <div class="open-action-row"><span class="open-action-label">Deviation</span><span>{{ action.deviation }}</span></div>
                <div class="open-action-row"><span class="open-action-label">Action taken</span><span>{{ action.actionTaken }}</span></div>
                <div class="open-action-row"><span class="open-action-label">Disposition</span><span>{{ action.productDisposition }}</span></div>
                <div v-if="action.retestResult" class="open-action-row open-action-resolved">
                  <span class="open-action-label">Retest</span><span>{{ action.retestResult }}</span>
                </div>
              </div>
            </div>

            <div class="panel-body-scroll">
              <p class="panel-lead">Required when a CCP is out of limit. Complete this before the batch can proceed.</p>

              <div class="field">
                <label class="field-label">CCP affected</label>
                <select v-model="correctiveForm.ccp" class="field-input field-input--short" required>
                  <option value="">Select…</option>
                  <option value="CCP1">CCP1 — pH</option>
                  <option value="CCP2">CCP2 — Pasteurisation</option>
                  <option value="CCP3">CCP3 — O₂ purge</option>
                  <option value="CCP4">CCP4 — Seam integrity</option>
                </select>
              </div>

              <div class="field">
                <label class="field-label">Deviation description</label>
                <textarea v-model="correctiveForm.deviation" class="field-input field-textarea" rows="2" placeholder="e.g. pH reading was 4.82, above critical limit of 4.6" required />
              </div>

              <div class="field">
                <label class="field-label">Root cause</label>
                <textarea v-model="correctiveForm.rootCause" class="field-input field-textarea" rows="2" placeholder="e.g. Insufficient citric acid added during conditioning" required />
              </div>

              <div class="field">
                <label class="field-label">Action taken</label>
                <textarea v-model="correctiveForm.actionTaken" class="field-input field-textarea" rows="2" placeholder="e.g. Added 5 g additional citric acid, mixed thoroughly, re-measured pH after 30 minutes" required />
              </div>

              <div class="field">
                <label class="field-label">Product disposition</label>
                <select v-model="correctiveForm.productDisposition" class="field-input field-input--short" required>
                  <option value="">Select…</option>
                  <option value="hold">Hold pending re-test</option>
                  <option value="re-pasteurised">Re-pasteurised</option>
                  <option value="disposed">Disposed / destroyed</option>
                  <option value="released">Released after corrective action</option>
                </select>
              </div>

              <div class="field">
                <label class="field-label">Re-test result (if resolved)</label>
                <input v-model="correctiveForm.retestResult" type="text" class="field-input" placeholder="e.g. pH re-measured at 4.1 — in limit. Batch released." />
              </div>

              <div v-if="correctiveError" class="form-error" role="alert">{{ correctiveError }}</div>
            </div>

            <div class="panel-footer">
              <button class="btn-cancel" @click="correctivePanelOpen = false">Cancel</button>
              <button
                class="btn-submit"
                :disabled="!correctiveForm.ccp || !correctiveForm.deviation || !correctiveForm.actionTaken || correctiveLoading"
                @click="submitCorrectiveAction()"
              >
                {{ correctiveLoading ? 'Saving…' : 'Record corrective action' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <!-- Log reading drawer -->
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="logPanelOpen" class="overlay" @click.self="logPanelOpen = false">
        <Transition name="panel">
          <div v-if="logPanelOpen" class="form-panel">
            <div class="panel-header">
              <div>
                <p class="panel-eyebrow">{{ batch?.batchId }}</p>
                <h2 class="panel-title">Log fermentation reading</h2>
              </div>
              <button class="panel-close" @click="logPanelOpen = false" aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <div class="panel-body-scroll">
              <!-- SG + Temp side by side -->
              <div class="field">
                <label class="field-label">Readings <span class="label-opt">(fill one or both)</span></label>
                <div class="log-readings-row">
                  <div class="log-reading-group">
                    <span class="log-reading-label">SG</span>
                    <input
                      v-model.number="logForm.sg"
                      type="number"
                      class="field-input"
                      step="0.001"
                      min="0.990"
                      max="1.150"
                      placeholder="1.010"
                    />
                  </div>
                  <div class="log-reading-group">
                    <span class="log-reading-label">Temp (°C)</span>
                    <input
                      v-model.number="logForm.tempC"
                      type="number"
                      class="field-input"
                      step="0.5"
                      min="-10"
                      max="50"
                      placeholder="20"
                    />
                  </div>
                </div>
              </div>

              <!-- Day -->
              <div class="field">
                <label class="field-label">Day</label>
                <input v-model.number="logForm.day" type="number" class="field-input field-input--short" min="0" step="1" />
              </div>

              <!-- Notes -->
              <div class="field">
                <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                <textarea v-model="logForm.notes" class="field-input field-textarea" rows="2" placeholder="Clarity, airlock activity, aromas…" />
              </div>

              <!-- Previous readings -->
              <div v-if="readings && readings.length > 0">
                <p class="field-label" style="margin-bottom:8px">Previous readings</p>
                <div class="readings-table-wrap">
                  <table class="readings-table">
                    <thead><tr><th>Day</th><th>SG</th><th>Temp</th><th>Notes</th></tr></thead>
                    <tbody>
                      <template v-for="day in [...new Set(readings.map(r => r.day))].sort((a,b)=>a-b)" :key="day">
                        <tr>
                          <td class="mono">{{ day }}</td>
                          <td class="mono">{{ readings.find(r => r.day === day && r.type === 'gravity')?.value?.toFixed(3) ?? '—' }}</td>
                          <td class="mono">{{ readings.find(r => r.day === day && r.type === 'temperature') ? readings.find(r => r.day === day && r.type === 'temperature')!.value + '°C' : '—' }}</td>
                          <td class="readings-notes">{{ readings.find(r => r.day === day && r.type === 'gravity')?.notes || readings.find(r => r.day === day && r.type === 'temperature')?.notes || '' }}</td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Stability alert -->
              <div v-if="isStable" class="stability-alert--ok">
                SG stable over ≥48 h — fermentation likely complete.
              </div>

              <div v-if="logError" class="form-error" role="alert">{{ logError }}</div>
            </div>

            <div class="panel-footer">
              <button class="btn-cancel" @click="logPanelOpen = false">Cancel</button>
              <button
                class="btn-submit"
                :disabled="(logForm.sg == null && logForm.tempC == null) || logLoading"
                @click="submitLogReading()"
              >
                {{ logLoading ? 'Saving…' : 'Save reading' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <!-- Mid-ferment ingredient addition drawer -->
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="fermentAddOpen" class="overlay" @click.self="fermentAddOpen = false">
        <Transition name="panel">
          <div v-if="fermentAddOpen" class="form-panel">
            <div class="panel-header">
              <div>
                <p class="panel-eyebrow">{{ batch?.batchId }} · Fermentation</p>
                <h2 class="panel-title">Add ingredient</h2>
              </div>
              <button class="panel-close" @click="fermentAddOpen = false" aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <div class="panel-body-scroll">
              <p class="panel-lead" style="margin-bottom:16px">Record any ingredient added mid-fermentation (e.g. nutrients, flavours, fruit). This deducts from stock.</p>
              <div class="field">
                <label class="field-label">Ingredient</label>
                <select v-model="fermentAdd.ingredientId" class="field-input" @change="onFermentIngSelect">
                  <option value="">— Select ingredient —</option>
                  <option v-for="ing in ingredients" :key="ing.id" :value="ing.id">{{ ing.name }}</option>
                </select>
              </div>
              <div class="field">
                <label class="field-label">Amount</label>
                <div style="display:flex;gap:8px;align-items:center">
                  <input v-model.number="fermentAdd.amount" type="number" class="field-input" min="0" step="0.001" style="max-width:120px" placeholder="0" />
                  <select v-model="fermentAdd.unit" class="field-input" style="max-width:90px">
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="L">L</option>
                    <option value="tbsp">tbsp</option>
                    <option value="tsp">tsp</option>
                    <option value="units">units</option>
                  </select>
                </div>
              </div>
              <div class="field">
                <label class="field-label">Day of fermentation</label>
                <input v-model.number="fermentAdd.day" type="number" class="field-input field-input--short" min="0" step="1" />
              </div>
              <div class="field">
                <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                <textarea v-model="fermentAdd.notes" class="field-input field-textarea" rows="2" placeholder="Why added, source, lot number…" />
              </div>
              <div v-if="fermentAddError" class="form-error" role="alert">{{ fermentAddError }}</div>
            </div>
            <div class="panel-footer">
              <button class="btn-cancel" @click="fermentAddOpen = false">Cancel</button>
              <button class="btn-submit" :disabled="!fermentAdd.ingredientId || !fermentAdd.amount || fermentAddLoading" @click="submitFermentAdd()">
                {{ fermentAddLoading ? 'Saving…' : 'Add & deduct stock' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <!-- Fermentation complete confirmation dialog -->
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="fermentCompleteDialogOpen" class="overlay overlay--center" @click.self="fermentCompleteDialogOpen = false">
        <div class="discard-dialog">
          <div class="discard-dialog-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke="#FF9F0A" stroke-width="1.5"/>
              <path d="M14 9v6M14 17.5v1" stroke="#FF9F0A" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>
          <p class="discard-dialog-title">Complete fermentation?</p>
          <p class="discard-dialog-sub">This will mark fermentation as complete and advance the batch to transfer. Make sure the SG has been stable for at least 48 hours before proceeding.</p>
          <div class="discard-dialog-actions">
            <button class="btn-cancel" @click="fermentCompleteDialogOpen = false">Cancel</button>
            <button class="btn-submit" :disabled="saving === 'ferment'" @click="confirmFermentComplete()">
              {{ saving === 'ferment' ? 'Saving…' : 'Yes, complete fermentation' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Discard confirmation dialog -->
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="discardDialogOpen" class="overlay overlay--center" @click.self="discardDialogOpen = false">
        <div class="discard-dialog">
          <div class="discard-dialog-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke="#E53935" stroke-width="1.5"/>
              <path d="M14 9v6M14 17.5v1" stroke="#E53935" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>
          <p class="discard-dialog-title">Discard batch {{ batch?.batchId }}?</p>
          <p class="discard-dialog-sub">This cannot be undone. The batch will be marked as discarded and removed from active production. It will remain visible in the production log.</p>
          <div class="field" style="margin-top:4px">
            <label class="field-label">Reason for discarding</label>
            <textarea v-model="discardReason" class="field-input field-textarea" rows="3" placeholder="e.g. Failed pH CCP, contamination suspected, equipment failure…" autofocus />
          </div>
          <div class="discard-dialog-actions">
            <button class="btn-cancel" @click="discardDialogOpen = false">Cancel</button>
            <button class="btn-discard-confirm" :disabled="!discardReason.trim() || discarding" @click="confirmDiscard()">
              {{ discarding ? 'Discarding…' : 'Discard batch' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

</template>

<script setup lang="ts">
import { STAGE_MAP, EQUIPMENT_CHECKLIST, PHASE_LABELS } from '~/types/batch'
import type { StageDefinition, StagePhase, CcpNumber } from '~/types/batch'
import { deductIngredients } from '~/composables/useBatch'
import type { RecipeIngredient } from '~/types/product'
import { serverTimestamp } from 'firebase/firestore'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const uiStore = useUiStore()
const route = useRoute()
const batchDocId = route.params.id as string

const {
  batch, readings, gravityReadings, correctiveActions, hasOpenCorrectiveActions,
  addReading, saveStage, stageIsDone, evalCcp, updateBatch, raiseCorrectiveAction,
} = useBatch(batchDocId)

// ── Load the linked product for recipe guidance ───────────
const { products } = useProducts()
const { ingredients } = useIngredients()
const linkedProduct = computed(() => {
  if (!batch.value?.productName) return null
  return products.value.find(p => p.name === batch.value!.productName) ?? null
})
// Dynamic ingredient amounts — keyed by ingredientId
const ingredientActuals = reactive<Record<string, number | null>>({})
const conditioningActuals = reactive<Record<string, number | null>>({})

interface CanRun { sizeMl: number | null; qty: number | null; defect: boolean }
const canRuns = ref<CanRun[]>([{ sizeMl: 330, qty: null, defect: false }])
function addCanRun() { canRuns.value.push({ sizeMl: 330, qty: null, defect: false }) }
function removeCanRun(i: number) { canRuns.value.splice(i, 1) }

const canRunsTotalMl = computed(() =>
  canRuns.value.reduce((sum, r) => sum + (r.sizeMl ?? 0) * (r.qty ?? 0), 0)
)
const canRunsGoodCans = computed(() =>
  canRuns.value.filter(r => !r.defect).reduce((sum, r) => sum + (r.qty ?? 0), 0)
)
const canRunsDefectCans = computed(() =>
  canRuns.value.filter(r => r.defect).reduce((sum, r) => sum + (r.qty ?? 0), 0)
)
const volumeAllowanceMl = computed(() => {
  const l = batch.value?.stageData?.secondary?.volumeTransferredL
  return l ? Number(l) * 1000 : null
})
const volumeUsedPct = computed(() => {
  if (!volumeAllowanceMl.value) return null
  return Math.min(100, Math.round((canRunsTotalMl.value / volumeAllowanceMl.value) * 100))
})

// ── Phase structure ───────────────────────────────────────
const PHASES = computed(() =>
  Object.entries(PHASE_LABELS).map(([key, label]) => ({ key: key as StagePhase, label }))
)

function stagesForPhase(phase: StagePhase) {
  return STAGE_MAP.filter(s => s.phase === phase)
}

function phaseComplete(phase: StagePhase): boolean {
  return stagesForPhase(phase).every(s => stageIsDone(s.key))
}

// ── Phase open/close ─────────────────────────────────────
const openPhase = ref<StagePhase | null>(null)

function togglePhase(phase: StagePhase) {
  if (openPhase.value === phase) {
    openPhase.value = null
    openStage.value = null
  } else {
    openPhase.value = phase
    // Close any open stage that's not in the new phase
    if (openStage.value !== null) {
      const stage = STAGE_MAP.find(s => s.n === openStage.value)
      if (stage && stage.phase !== phase) openStage.value = null
    }
    // Single-stage phases: auto-open the one stage so its panel shows
    const phaseStages = STAGE_MAP.filter(s => s.phase === phase)
    if (phaseStages.length === 1) {
      openStage.value = phaseStages[0].n
    }
  }
}

// ── Stage open/close ─────────────────────────────────────
const openStage = ref<number | null>(null)
const saving = ref<string | null>(null)

watch(batch, (b) => {
  if (!b || openPhase.value !== null) return
  const next = STAGE_MAP.find(s => !stageIsDone(s.key, b))
  if (next) {
    openPhase.value = next.phase
    openStage.value = next.n
  }
}, { immediate: true })

function toggleStage(n: number) {
  openStage.value = openStage.value === n ? null : n
  const stage = STAGE_MAP.find(s => s.n === n)
  if (stage) prefillForm(stage.key)
}

// Pre-fill forms from saved stageData when opening a stage
function prefillForm(key: string) {
  const saved = batch.value?.stageData?.[key]
  if (saved) {
    const target = (forms as Record<string, Record<string, unknown>>)[key]
    if (target) {
      for (const [k, v] of Object.entries(saved)) {
        if (k in target) target[k] = v as never
      }
    }
    // Restore conditioning actuals from saved actuals map
    if (key === 'condition' && saved.actuals && typeof saved.actuals === 'object') {
      for (const [id, qty] of Object.entries(saved.actuals as Record<string, number>)) {
        conditioningActuals[id] = qty
      }
    }
    // Restore can runs
    if (key === 'canning' && Array.isArray(saved.canRuns) && saved.canRuns.length) {
      canRuns.value = saved.canRuns as CanRun[]
    }
  }
  if (key === 'label' && !forms.label.bestBefore) {
    forms.label.bestBefore = sixMonthsFromNow()
  }
}

// ── Stage status ─────────────────────────────────────────
function stageStatus(n: number): 'done' | 'next' | 'locked' {
  const stage = STAGE_MAP.find(s => s.n === n)
  if (!stage) return 'locked'
  if (stageIsDone(stage.key)) return 'done'
  for (const s of STAGE_MAP) {
    if (!stageIsDone(s.key)) return s.n === n ? 'next' : 'locked'
  }
  return 'locked'
}

// ── Per-stage forms ───────────────────────────────────────
function sixMonthsFromNow() {
  const d = new Date()
  d.setMonth(d.getMonth() + 6)
  return d.toISOString().slice(0, 10)
}
const forms = reactive({
  sanitise:    { checked: [] as string[], notes: '' },
  ingredients: { notes: '' },
  brew:        { brewTempC: 93 as number|null, steepMinutes: 8 as number|null, brewVolumeL: null as number|null, notes: '' },
  sweeten:     { wortTempAfterSugarC: 80 as number|null, sugarDissolvedConfirmed: false, notes: '' },
  og:          { ogRecorded: 1.030 as number|null, notes: '' },
  cool:        { finalTempC: 20 as number|null, waterAddedL: null as number|null, notes: '' },
  pitch:       { pitchTempC: 20 as number|null, yeastHydrated: false, notes: '' },
  ferment:     { notes: '' },
  secondary:   { volumeTransferredL: null as number|null, notes: '' },
  condition:   { notes: '' },
  arrest:      { notes: '' },
  ccp1:        { ph: 4.2 as number|null, notes: '' },
  precan:      { precanPh: 4.2 as number|null, precanClarity: '', precanCarbonation: '', precanTaste: '', notes: '' },
  canning:     { notes: '' },
  ccp3:        { purgeConfirmed: false, gasType: '' as 'CO2'|'N2'|'', notes: '' },
  ccp4:        { seamVisualPass: null as boolean|null, leakTestPass: null as boolean|null, metalFragmentsNone: null as boolean|null, notes: '' },
  ccp2:        { waterBathTempC: 76 as number|null, holdTimeMinutes: 12 as number|null, notes: '' },
  inspect:     { cansInspected: null as number|null, defectsFound: 0 as number|null, notes: '' },
  label:       { bestBefore: sixMonthsFromNow(), notes: '' },
})

// ── Save a stage ─────────────────────────────────────────
async function saveStageClick(stage: StageDefinition) {
  if (!authStore.user) return
  saving.value = stage.key
  try {
    const formData = (forms as Record<string, Record<string, unknown>>)[stage.key] ?? {}

    const cleanData = { ...formData } as Record<string, unknown>

    // Merge conditioning actuals into saved data so they persist
    if (stage.key === 'condition') {
      cleanData.actuals = { ...conditioningActuals }
    }

    // Evaluate CCP pass/fail inline and add to stored data
    if (stage.ccp) {
      const result = evalCcp(stage.ccp, cleanData)
      if (result === 'fail') {
        uiStore.toast(`${stage.ccp} — limit breached. Raise a corrective action.`, 'warn')
      }
      cleanData.phPass = result === 'pass'
    }

    // OG/FG from pitch/canning flow up to batch recipe for stats
    const batchUpdates: Record<string, unknown> = {}
    if (stage.key === 'og' && cleanData.ogRecorded) {
      batchUpdates['recipe.og'] = cleanData.ogRecorded
      await addReading({
        type: 'gravity',
        value: cleanData.ogRecorded as number,
        day: 0,
        notes: 'OG',
        userId: authStore.user!.uid,
      })
    }
    // Save pitch temp as a day-0 temperature reading so fermentation log starts with initial temp
    if (stage.key === 'pitch') {
      const pitchTemp = batch.value?.stageData?.cool?.finalTempC
      if (pitchTemp != null) {
        await addReading({
          type: 'temperature',
          value: pitchTemp,
          day: 0,
          notes: 'Pitch temp',
          userId: authStore.user!.uid,
        })
      }
    }
    // Store FG on ferment stageData so inventory/log can compute ABV without reading the subcollection
    if (stage.key === 'ferment') {
      const lastReading = gravityReadings.value?.[gravityReadings.value.length - 1]
      if (lastReading) cleanData.fgRecorded = lastReading.value
    }
    // Transfer to secondary: flip the fermenter (A↔B)
    if (stage.key === 'secondary') {
      batchUpdates.fermenter = batch.value?.fermenter === 'A' ? 'B' : 'A'
    }
    if (stage.key === 'label') {
      batchUpdates.status = 'complete'
    }

    // Deduct ingredients from stock when the ingredients stage is confirmed
    if (stage.key === 'ingredients' && linkedProduct.value?.recipe.length && batch.value) {
      const usages = linkedProduct.value.recipe.map(ri => ({
        ingredientId: ri.ingredientId,
        ingredientName: ri.ingredientName,
        // Use actual entered value, fall back to recipe target if not entered
        quantityUsed: ingredientActuals[ri.ingredientId] ?? ri.amountPerBatch,
        unit: ri.unit,
        notes: forms.ingredients.notes,
      }))
      await deductIngredients({
        batchId: batchDocId,
        batchRef: batch.value.batchId ?? batchDocId,
        stageKey: 'ingredients',
        usages,
        userId: authStore.user.uid,
      })
    }

    // Deduct conditioning ingredients from stock when conditioning stage is confirmed
    if (stage.key === 'condition' && linkedProduct.value?.conditioning?.length && batch.value) {
      const usages = linkedProduct.value.conditioning.map(ri => ({
        ingredientId: ri.ingredientId,
        ingredientName: ri.ingredientName,
        quantityUsed: conditioningActuals[ri.ingredientId] ?? ri.amountPerBatch,
        unit: ri.unit,
        notes: forms.condition.notes,
      }))
      await deductIngredients({
        batchId: batchDocId,
        batchRef: batch.value.batchId ?? batchDocId,
        stageKey: 'condition',
        usages,
        userId: authStore.user.uid,
      })
    }

    // Include can runs in saved data
    if (stage.key === 'canning') {
      cleanData.canRuns = canRuns.value.filter(r => r.qty && r.qty > 0)
    }

    // Deduct packaging ingredients when canning stage is confirmed
    if (stage.key === 'canning' && linkedProduct.value?.recipe.length && batch.value) {
      const totalCansUsed = canRunsGoodCans.value + canRunsDefectCans.value
      if (totalCansUsed > 0) {
        const packagingIngredientIds = new Set(
          ingredients.value
            .filter(i => i.category === 'packaging' || i.category === 'gas')
            .map(i => i.id)
        )
        const runSummary = canRuns.value
          .filter(r => r.qty && r.qty > 0)
          .map(r => `${r.qty}×${r.sizeMl}ml${r.defect ? ' (defect)' : ''}`)
          .join(', ')
        const usages = linkedProduct.value.recipe
          .filter(ri => packagingIngredientIds.has(ri.ingredientId))
          .map(ri => ({
            ingredientId: ri.ingredientId,
            ingredientName: ri.ingredientName,
            quantityUsed: ri.amountPerBatch * totalCansUsed,
            unit: ri.unit,
            notes: `Canning run: ${runSummary}`,
          }))
        if (usages.length) {
          await deductIngredients({
            batchId: batchDocId,
            batchRef: batch.value.batchId ?? batchDocId,
            stageKey: 'canning',
            usages,
            userId: authStore.user.uid,
          })
        }
      }
    }

    await saveStage({
      stageKey: stage.key,
      stageNum: stage.n,
      data: cleanData,
      userId: authStore.user.uid,
    })

    if (Object.keys(batchUpdates).length) {
      await updateBatch(batchUpdates)
    }

    uiStore.toast(stage.label + ' saved', 'ok')

    // Auto-advance — open next stage and switch phase if needed
    const next = STAGE_MAP.find(s => s.n > stage.n && !stageIsDone(s.key))
    if (next) {
      if (next.phase !== openPhase.value) openPhase.value = next.phase
      openStage.value = next.n
    } else {
      openStage.value = null
    }
  } catch (e) {
    console.error('saveStage failed:', e)
    uiStore.toast('Failed to save — please try again', 'warn')
  } finally {
    saving.value = null
  }
}

// ── CCP2 live result ──────────────────────────────────────
const ccp2LiveResult = computed<'pass' | 'fail' | null>(() => {
  const f = forms.ccp2
  if (f.waterBathTempC == null || f.holdTimeMinutes == null) return null
  if (f.waterBathTempC < 75 || f.holdTimeMinutes < 10) return 'fail'
  return 'pass'
})

// ── Stats strip computed ──────────────────────────────────
const latestSG = computed(() => {
  const gs = gravityReadings.value
  if (!gs?.length) return null
  return gs[gs.length - 1].value.toFixed(3)
})

const ogDisplay = computed(() => {
  const og = batch.value?.stageData?.og?.ogRecorded ?? batch.value?.stageData?.pitch?.ogRecorded
  return og ? og.toFixed(3) : '—'
})

const pitchTempDisplay = computed(() => {
  const t = batch.value?.stageData?.pitch?.pitchTempC
  return t != null ? `${t}°C` : '—'
})

const totalVolumeL = computed(() => {
  const brewVol = batch.value?.stageData?.brew?.brewVolumeL ?? forms.brew.brewVolumeL
  const waterAdded = batch.value?.stageData?.cool?.waterAddedL ?? forms.cool.waterAddedL
  if (brewVol == null) return null
  return brewVol + (waterAdded ?? 0)
})

const estimatedAbv = computed(() => {
  const og = batch.value?.stageData?.og?.ogRecorded ?? batch.value?.stageData?.pitch?.ogRecorded ?? forms.og.ogRecorded
  if (!og) return null
  const latestSgVal = latestSG.value ? parseFloat(latestSG.value) : null
  const fg = latestSgVal !== null ? Math.min(latestSgVal, 1.000) : 1.000
  return ((og - fg) * 131.25).toFixed(1) + '%'
})

const currentAbv = computed(() => {
  const og = batch.value?.stageData?.og?.ogRecorded ?? batch.value?.stageData?.pitch?.ogRecorded
  const sg = latestSG.value ? parseFloat(latestSG.value) : null
  if (!og || !sg) return null
  return ((og - sg) * 131.25).toFixed(1) + '%'
})

const daysSincePitch = computed(() => {
  if (!batch.value?.startDate) return '—'
  const ms = Date.now() - batch.value.startDate.toDate().getTime()
  return Math.floor(ms / 86400000)
})

// ── Completion summary data ───────────────────────────────
interface SummaryRow { label: string; value: string }

const completionCansTotal = computed(() => {
  const runs = batch.value?.stageData?.canning?.canRuns
  if (!Array.isArray(runs)) return '—'
  const good = (runs as CanRun[]).filter(r => !r.defect).reduce((s, r) => s + (r.qty ?? 0), 0)
  return good ? String(good) : '—'
})

const completionNotes = computed(() => {
  const sd = batch.value?.stageData
  if (!sd) return { brew: [], ferment: [], condition: [], canning: [], post: [] }

  const row = (label: string, value: string | number | null | undefined): SummaryRow | null =>
    value != null && value !== '' ? { label, value: String(value) } : null

  const brew: SummaryRow[] = [
    row('Brew temp', sd.brew?.brewTempC != null ? `${sd.brew.brewTempC}°C` : null),
    row('Steep time', sd.brew?.steepMinutes != null ? `${sd.brew.steepMinutes} min` : null),
    row('Tea volume', sd.brew?.brewVolumeL != null ? `${sd.brew.brewVolumeL} L` : null),
    row('Brew notes', sd.brew?.notes),
    row('Sugar dissolved', sd.sweeten?.sugarDissolvedConfirmed ? 'Confirmed' : null),
    row('Sweeten notes', sd.sweeten?.notes),
    row('Cool to', sd.cool?.finalTempC != null ? `${sd.cool.finalTempC}°C` : null),
    row('Cold water added', sd.cool?.waterAddedL != null ? `${sd.cool.waterAddedL} L` : null),
    row('Cool notes', sd.cool?.notes),
    row('Pitch temp', sd.pitch?.pitchTempC != null ? `${sd.pitch.pitchTempC}°C` : null),
    row('OG', (sd.og?.ogRecorded ?? sd.pitch?.ogRecorded) != null ? Number(sd.og?.ogRecorded ?? sd.pitch?.ogRecorded).toFixed(3) : null),
    row('Yeast hydrated', sd.pitch?.yeastHydrated ? 'Yes' : null),
    row('Pitch notes', sd.pitch?.notes),
    row('Ingredients notes', sd.ingredients?.notes),
    row('Sanitise notes', sd.sanitise?.notes),
  ].filter(Boolean) as SummaryRow[]

  const readingCount = gravityReadings.value?.length ?? 0
  const ferment: SummaryRow[] = [
    row('SG readings', readingCount ? String(readingCount) : null),
    row('Final SG', latestSG.value),
    row('Ferment notes', sd.ferment?.notes),
    row('Transfer notes', sd.secondary?.notes),
  ].filter(Boolean) as SummaryRow[]

  const cond = linkedProduct.value?.conditioning ?? []
  const savedActuals = (sd.condition?.actuals ?? {}) as Record<string, number>
  const condIngredients: SummaryRow[] = cond.map(ri => ({
    label: ri.ingredientName,
    value: `${savedActuals[ri.ingredientId] ?? ri.amountPerBatch} ${ri.unit}`,
  }))
  const condition: SummaryRow[] = [
    ...condIngredients,
    row('pH (CCP1)', sd.ccp1?.ph != null ? `${Number(sd.ccp1.ph).toFixed(2)} — ${sd.ccp1.phPass ? 'pass' : 'FAIL'}` : null),
    row('Conditioning notes', sd.condition?.notes),
    row('Arrest notes', sd.arrest?.notes),
    row('Pre-can clarity', sd.precan?.precanClarity),
    row('Pre-can carbonation', sd.precan?.precanCarbonation),
    row('Pre-can taste', sd.precan?.precanTaste),
    row('Pre-can notes', sd.precan?.notes),
  ].filter(Boolean) as SummaryRow[]

  const canRuns = Array.isArray(sd.canning?.canRuns) ? (sd.canning.canRuns as CanRun[]) : []
  const goodCans = canRuns.filter(r => !r.defect).reduce((s, r) => s + (r.qty ?? 0), 0)
  const defectCans = canRuns.filter(r => r.defect).reduce((s, r) => s + (r.qty ?? 0), 0)
  const canSizes = [...new Set(canRuns.filter(r => !r.defect).map(r => `${r.sizeMl} ml`))].join(', ')
  const canning: SummaryRow[] = [
    row('Cans filled', goodCans ? `${goodCans}${defectCans ? ` (${defectCans} defect)` : ''}` : null),
    row('Can sizes', canSizes || null),
    row('Lot code', sd.canning?.lotCode),
    row('Fill temp', sd.canning?.fillTempC != null ? `${sd.canning.fillTempC}°C` : null),
    row('Seamer ref', sd.canning?.seamerRef),
    row('Canning notes', sd.canning?.notes),
    row('O₂ purge (CCP3)', sd.ccp3?.purgeConfirmed ? `Confirmed · ${sd.ccp3.gasType ?? ''}` : sd.ccp3 ? 'Not confirmed' : null),
    row('CCP3 notes', sd.ccp3?.notes),
    row('Seam visual (CCP4)', sd.ccp4?.seamVisualPass != null ? (sd.ccp4.seamVisualPass ? 'Pass' : 'FAIL') : null),
    row('Leak test (CCP4)', sd.ccp4?.leakTestPass != null ? (sd.ccp4.leakTestPass ? 'Pass' : 'FAIL') : null),
    row('Metal fragments (CCP4)', sd.ccp4?.metalFragmentsNone != null ? (sd.ccp4.metalFragmentsNone ? 'None found' : 'FOUND') : null),
    row('CCP4 notes', sd.ccp4?.notes),
    row('Pasteur. temp (CCP2)', sd.ccp2?.waterBathTempC != null ? `${sd.ccp2.waterBathTempC}°C` : null),
    row('Pasteur. hold (CCP2)', sd.ccp2?.holdTimeMinutes != null ? `${sd.ccp2.holdTimeMinutes} min` : null),
    row('CCP2 notes', sd.ccp2?.notes),
    row('Cans inspected', sd.inspect?.cansInspected != null ? String(sd.inspect.cansInspected) : null),
    row('Defects found', sd.inspect?.defectsFound != null ? String(sd.inspect.defectsFound) : null),
    row('Inspection notes', sd.inspect?.notes),
  ].filter(Boolean) as SummaryRow[]

  const post: SummaryRow[] = [
    row('Best before', sd.label?.bestBefore),
    row('Label notes', sd.label?.notes),
    row('Batch notes', batch.value?.notes),
  ].filter(Boolean) as SummaryRow[]

  return { brew, ferment, condition, canning, post }
})

const fermentStable = computed(() => {
  const gs = gravityReadings.value ?? []
  if (gs.length < 2) return false
  const last = gs[gs.length - 1]
  const prev = gs[gs.length - 2]
  return Math.abs(last.value - prev.value) < 0.001 && (last.day - prev.day) >= 2
})

const batchLocked = computed(() =>
  batch.value?.status === 'complete' || batch.value?.status === 'disposed'
)

const showSummary = ref(false)
watch(() => batch.value?.status, (s) => {
  if (s === 'complete') showSummary.value = true
}, { immediate: true })

const statusLabel = computed(() => {
  const b = batch.value
  if (!b) return ''
  if (b.status === 'hold') return 'On hold'
  if (b.status === 'disposed') return 'Disposed'
  if (b.status === 'complete') return 'Complete'
  if (b.status === 'ready_to_can') return 'Ready to can'
  if (b.stage === 0) return 'Not started'
  // Show the next stage after the last completed one (the currently active stage)
  const next = STAGE_MAP.find(s => s.n > b.stage)
  if (next) return next.label
  return STAGE_MAP.find(s => s.n === b.stage)?.label ?? 'In progress'
})

function fmtDate(ts: { toDate?: () => Date } | null | undefined): string {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// ── Stage summary (collapsed row) ────────────────────────
function stageSummary(stage: StageDefinition): string | null {
  if (stageStatus(stage.n) !== 'done') return null
  const d = batch.value?.stageData?.[stage.key]
  if (!d) return null

  if (stage.key === 'sanitise') return 'Equipment sanitised'
  if (stage.key === 'ingredients') return d.notes ? `Confirmed · ${d.notes}` : 'Ingredients confirmed'
  if (stage.key === 'brew') return [d.brewTempC && `${d.brewTempC}°C`, d.steepMinutes && `${d.steepMinutes} min`].filter(Boolean).join(' · ') || 'Brewed'
  if (stage.key === 'sweeten') return 'Sugar dissolved'
  if (stage.key === 'og') return d.ogRecorded ? `OG ${Number(d.ogRecorded).toFixed(3)}` : 'Recorded'
  if (stage.key === 'cool') return d.finalTempC ? `${d.finalTempC}°C` : 'Cooled'
  if (stage.key === 'pitch') return [d.pitchTempC && `${d.pitchTempC}°C`, d.ogRecorded && `OG ${Number(d.ogRecorded).toFixed(3)}`].filter(Boolean).join(' · ') || 'Pitched'
  if (stage.key === 'ferment') {
    const count = gravityReadings.value?.length ?? 0
    const last = gravityReadings.value?.[count - 1]
    return last ? `${count} readings · last SG ${last.value.toFixed(3)}` : `${count} readings`
  }
  if (stage.key === 'secondary') return d.volumeTransferredL ? `${d.volumeTransferredL} L transferred` : 'Transferred'
  if (stage.key === 'condition') {
    const cond = linkedProduct.value?.conditioning ?? []
    const savedActuals = (d.actuals ?? {}) as Record<string, number>
    const summary = cond.map(ri => `${savedActuals[ri.ingredientId] ?? ri.amountPerBatch}${ri.unit} ${ri.ingredientName}`).join(' · ')
    return summary || (d.notes ? d.notes : 'Confirmed')
  }
  if (stage.key === 'ccp1') return d.ph != null ? `pH ${d.ph}` : 'Logged'
  if (stage.key === 'precan') return [d.precanClarity, d.precanCarbonation].filter(Boolean).join(' · ') || 'Passed'
  if (stage.key === 'canning') {
    const runs = Array.isArray(d.canRuns) ? (d.canRuns as CanRun[]) : []
    const good = runs.filter(r => !r.defect).reduce((s, r) => s + (r.qty ?? 0), 0)
    const defect = runs.filter(r => r.defect).reduce((s, r) => s + (r.qty ?? 0), 0)
    const canStr = good ? `${good} cans` + (defect ? ` (${defect} defect)` : '') : ''
    return canStr || 'Recorded'
  }
  if (stage.key === 'ccp3') return d.purgeConfirmed ? 'Purge confirmed' : 'Logged'
  if (stage.key === 'ccp4') return d.seamVisualPass ? 'Visual pass' : 'Logged'
  if (stage.key === 'ccp2') return d.waterBathTempC ? `${d.waterBathTempC}°C · ${d.holdTimeMinutes} min` : 'Logged'
  if (stage.key === 'inspect') return d.defectsFound != null ? `${d.defectsFound} defects` : 'Inspected'
  if (stage.key === 'label') return d.bestBefore ? `BB: ${d.bestBefore}` : 'Labelled'
  return fmtDate(d.confirmedAt)
}

// ── Phase summary (shown when phase is complete and collapsed) ──
interface PhaseStat { label: string; value: string }

function phaseSummary(phase: StagePhase): PhaseStat[] {
  const sd = batch.value?.stageData
  if (!sd) return []

  if (phase === 'brew') {
    const stats: PhaseStat[] = []
    const brew = sd.brew; const pitch = sd.pitch; const cool = sd.cool; const og = sd.og
    if (brew?.brewTempC) stats.push({ label: 'Brew temp', value: `${brew.brewTempC}°C` })
    if (brew?.steepMinutes) stats.push({ label: 'Steep', value: `${brew.steepMinutes} min` })
    if (brew?.brewVolumeL) stats.push({ label: 'Tea vol', value: `${brew.brewVolumeL} L` })
    const ogVal = og?.ogRecorded ?? pitch?.ogRecorded
    if (ogVal) stats.push({ label: 'OG', value: Number(ogVal).toFixed(3) })
    if (cool?.finalTempC) stats.push({ label: 'Cool to', value: `${cool.finalTempC}°C` })
    if (pitch?.pitchTempC) stats.push({ label: 'Pitch temp', value: `${pitch.pitchTempC}°C` })
    if (pitch?.yeastHydrated) stats.push({ label: 'Yeast', value: 'Hydrated' })
    return stats
  }

  if (phase === 'ferment') {
    const stats: PhaseStat[] = []
    const count = gravityReadings.value?.length ?? 0
    const last = gravityReadings.value?.[count - 1]
    const first = gravityReadings.value?.[0]
    const og = (sd.og?.ogRecorded ?? sd.pitch?.ogRecorded) ? Number(sd.og?.ogRecorded ?? sd.pitch?.ogRecorded) : first?.value
    if (count) stats.push({ label: 'SG readings', value: String(count) })
    if (last && count > 1) stats.push({ label: 'FG', value: last.value.toFixed(3) })
    if (og && last && count > 1) {
      const drop = ((og - last.value) * 1000).toFixed(0)
      stats.push({ label: 'SG drop', value: `${drop} pts` })
    }
    if (sd.secondary?.volumeTransferredL) stats.push({ label: 'Volume transferred', value: `${sd.secondary.volumeTransferredL} L` })
    if (sd.secondary?.volumeTransferredL) stats.push({ label: 'Fermenter', value: batch.value?.fermenter ?? '—' })
    return stats
  }

  if (phase === 'condition') {
    const stats: PhaseStat[] = []
    if (sd.ccp1?.ph != null) stats.push({ label: 'pH', value: Number(sd.ccp1.ph).toFixed(2) })
    const cond = linkedProduct.value?.conditioning ?? []
    const savedActuals = (sd.condition?.actuals ?? {}) as Record<string, number>
    for (const ri of cond) {
      const actual = savedActuals[ri.ingredientId] ?? ri.amountPerBatch
      stats.push({ label: ri.ingredientName, value: `${actual} ${ri.unit}` })
    }
    if (!stats.length) stats.push({ label: 'Conditioning', value: 'Done' })
    return stats
  }

  if (phase === 'canning') {
    const stats: PhaseStat[] = []
    const can = sd.canning; const ccp2 = sd.ccp2
    if (can?.canRuns && Array.isArray(can.canRuns) && can.canRuns.length) {
      const runs = can.canRuns as CanRun[]
      const good = runs.filter(r => !r.defect).reduce((s, r) => s + (r.qty ?? 0), 0)
      const defect = runs.filter(r => r.defect).reduce((s, r) => s + (r.qty ?? 0), 0)
      stats.push({ label: 'Cans filled', value: String(good) + (defect ? ` (−${defect})` : '') })
      const sizes = [...new Set(runs.filter(r => !r.defect).map(r => `${r.sizeMl} ml`))].join(', ')
      if (sizes) stats.push({ label: 'Sizes', value: sizes })
    }
    if (ccp2?.waterBathTempC) stats.push({ label: 'Pasteur.', value: `${ccp2.waterBathTempC}°C · ${ccp2.holdTimeMinutes} min` })
    if (sd.inspect?.defectsFound != null) stats.push({ label: 'Defects', value: String(sd.inspect.defectsFound) })
    return stats
  }

  if (phase === 'post') {
    const stats: PhaseStat[] = []
    const lbl = sd.label
    if (lbl?.bestBefore) stats.push({ label: 'Best before', value: lbl.bestBefore })
    return stats
  }

  return []
}

// ── Help content ──────────────────────────────────────────
interface StageHelp {
  n: number
  title: string
  what?: string[]
  check?: string[]
  next?: string
  critical?: string
}

const STAGE_HELP: Record<string, StageHelp> = {
  sanitise: {
    n: 1, title: 'Sanitise equipment',
    what: [
      'Clean and sanitise the table surface first, then all equipment.',
      'Use food-grade sanitiser at the correct dilution — no rinse required for no-rinse products.',
      'Let equipment drain; do not towel-dry as this re-contaminates surfaces.',
    ],
    check: [
      'Fermenter vessel, airlock, thermometer probe, hydrometer, stirring spoon, measuring jugs, measuring spoons.',
      'No visible residue or scale from previous batches.',
      'Sanitiser concentration correct — check the label.',
    ],
    next: 'While equipment is draining, measure out your ingredients.',
  },
  ingredients: {
    n: 2, title: 'Ingredients check',
    what: [
      'Measure out tea leaves, sugar, yeast, and nutrients.',
      'Check all ingredients are within their use-by date.',
      'Note any lot numbers or quality concerns in the notes field.',
    ],
    check: [
      'Tea leaves: correct grade, no off-odours, packaging intact.',
      'Sugar: white granulated, no clumping or contamination.',
      'Yeast: within use-by, stored correctly — allow to reach room temp before pitching.',
    ],
    next: 'Heat brew water to 90–95°C. Add tea leaves as soon as temperature is reached.',
  },
  brew: {
    n: 3, title: 'Brew the tea',
    what: [
      'Heat brew water to 90–95°C.',
      'Add measured tea leaves and steep for 8 minutes.',
      'Remove leaves without squeezing — squeezing extracts harsh tannins.',
    ],
    check: [
      'Temperature confirmed with the probe before steeping.',
      'Steep time measured from when leaves were added.',
      'Liquid is deep amber with a clean tea aroma.',
    ],
    next: 'Add sugar while the tea is still hot — above 70°C it dissolves almost instantly.',
  },
  sweeten: {
    n: 4, title: 'Dissolve sugar',
    what: [
      'Add all the sugar to the hot tea.',
      'Stir continuously until no crystals remain.',
      'Confirm full dissolution before moving on.',
    ],
    check: [
      'No visible sugar crystals remaining.',
      'No caramelisation — liquid should stay amber, not darken.',
    ],
    next: 'Start cooling immediately. Allow 30–60 minutes to reach pitch temperature.',
    critical: 'Do not pitch yeast into wort above 25°C — heat kills it.',
  },
  og: {
    n: 5, title: 'Measure OG',
    what: [
      'Take a hydrometer reading from the hot wort before cooling.',
      'Float the hydrometer in a sample tube — ensure it is not touching the sides.',
      'Read at the bottom of the meniscus. Record to 3 decimal places.',
    ],
    check: [
      'Hydrometer sanitised before use.',
      'Reading taken while wort is well mixed — stir gently first.',
      'OG typically around 1.030 for this recipe.',
    ],
    next: 'Start cooling immediately after recording OG.',
  },
  cool: {
    n: 6, title: 'Cool to pitch temp',
    what: [
      'Cool the wort to 18–22°C before pitching.',
      'Place the vessel in an ice bath or cool water to speed the process.',
      'Stir occasionally to equalise temperature throughout.',
    ],
    check: [
      'Temperature confirmed with the sanitised probe — not estimated.',
      'Fermenter and all contact surfaces sanitised during the cooling window.',
    ],
    next: 'Rehydrate dry yeast in 30–35°C water for 15 minutes while the wort cools. Have nutrients ready.',
    critical: 'Do not pitch above 25°C.',
  },
  pitch: {
    n: 6, title: 'Pitch yeast',
    what: [
      'Rehydrate dry yeast: sprinkle onto 30–35°C water, wait 15 min — do not stir.',
      'Add yeast nutrients to the wort and stir gently.',
      'Pitch the rehydrated yeast into the fermenter.',
      'Fit the airlock immediately.',
    ],
    check: [
      'Wort temperature confirmed within 18–22°C before pitching.',
      'OG recorded before sealing the fermenter.',
      'Airlock fitted and filled.',
    ],
    next: 'Fermentation typically becomes active within 12–48 hours. Log your first SG reading on Day 1.',
  },
  ferment: {
    n: 7, title: 'Fermentation',
    what: [
      'Log SG readings every 1–2 days.',
      'Note airlock activity, clarity, and any aromas.',
      'Keep the fermenter in a stable environment at 18–22°C.',
    ],
    check: [
      'SG dropping steadily — flat readings early on can indicate a slow start.',
      'No strong off-odours (sulphur, acetone, vinegar).',
      'Fermentation is complete when SG is stable across two readings ≥48 h apart.',
    ],
    next: 'Once stable, transfer to secondary and add conditioning ingredients.',
    critical: 'Do not proceed to secondary until SG is stable — premature transfer risks over-carbonation in the can.',
  },
  secondary: {
    n: 8, title: 'Transfer to secondary',
    what: [
      'Sanitise the secondary vessel before transfer.',
      'Transfer carefully — leave the yeast cake behind.',
      'Fit the airlock to the secondary vessel.',
    ],
    check: [
      'SG confirmed stable before transfer.',
      'Minimal yeast carried over.',
      'Secondary vessel clean with no residue from previous batches.',
    ],
    next: 'Add conditioning ingredients in the next stage. Have everything measured and ready.',
  },
  condition: {
    n: 9, title: 'Add conditioning',
    what: [
      'Add any conditioning ingredients per the product recipe.',
      'Stir gently to incorporate — do not splash.',
      'Seal the vessel and leave to rest for 24–48 hours.',
    ],
    check: [
      'All additions measured and recorded accurately.',
      'Vessel sealed after additions.',
      'pH will be checked at CCP1 before canning.',
    ],
    next: 'After the conditioning rest (24–48 h), confirm fermentation has arrested, then measure pH at CCP1.',
  },
  arrest: {
    n: 10, title: 'Confirm arrest',
    what: [
      'Take a final gravity reading.',
      'Compare to the previous reading — no change confirms fermentation has stopped.',
    ],
    check: [
      'SG unchanged from the previous reading (taken ≥24 h apart).',
      'No visible airlock activity.',
      'Clean aroma — no active fermentation character.',
    ],
    next: 'Measure pH at CCP1 — the critical check before any product is canned.',
    critical: 'Do not can if fermentation is still active — this is a food safety risk.',
  },
  ccp1: {
    n: 11, title: 'CCP1 — pH check',
    what: [
      'Calibrate the pH meter with fresh buffer solutions.',
      'Take a reading from a mid-vessel sample.',
      'Allow 30–60 seconds for the reading to stabilise.',
    ],
    check: [
      'Meter calibrated — check buffer expiry.',
      'pH ≤ 4.6 to pass the critical limit.',
    ],
    next: 'If pH passes, proceed to the pre-can quality check. If it fails, raise a corrective action immediately.',
    critical: 'pH > 4.6 is a critical limit breach. Product must not be canned until a corrective action is completed and pH re-tested.',
  },
  precan: {
    n: 12, title: 'Pre-can quality check',
    what: [
      'Draw a sample and assess clarity, carbonation, and taste.',
      'Re-check pH if more than 24 hours have passed since CCP1.',
    ],
    check: [
      'No off-flavours: excess acidity, acetone, or sulphur.',
      'Carbonation appropriate for the product.',
      'Colour and aroma consistent with previous batches.',
    ],
    next: 'Set up the canning line — seamer ready, gas connected, cans staged.',
  },
  canning: {
    n: 13, title: 'Canning run',
    what: [
      'Fill and seam cans at the correct fill temperature.',
      'Record the number of cans, lot code, and fill temperature.',
      'The lot code must be unique and traceable to this batch.',
    ],
    check: [
      'Fill level consistent — not under or over filled.',
      'Lot code applied correctly to all cans.',
      'Seamer settings verified before starting.',
    ],
    next: 'Immediately after filling: confirm O₂ purge (CCP3) and seam integrity (CCP4).',
  },
  ccp3: {
    n: 14, title: 'CCP3 — O₂ purge',
    what: [
      'Apply food-grade CO₂ or N₂ purge to every can before filling.',
      'Record the gas certificate reference number.',
      'Measure dissolved oxygen on a filled sample if equipment is available.',
    ],
    check: [
      'Gas certificate is current and food-grade rated.',
      'Purge applied to every can — no exceptions.',
      'DO ≤ 0.3 mg/L if measured.',
    ],
    next: 'Check seam integrity on filled cans (CCP4).',
    critical: 'If purge was not applied to any can, those cans must be disposed of. Raise a corrective action.',
  },
  ccp4: {
    n: 15, title: 'CCP4 — Seam integrity',
    what: [
      'Visually inspect all seams — look for crimping defects, damage, or misalignment.',
      'Conduct a teardown on the required number of cans.',
      'Submerge a sample in water for 30 seconds and observe for bubbles.',
    ],
    check: [
      'Visual: no damaged, crushed, or misaligned seams.',
      'Teardown: seam dimensions within tolerance.',
      'Leak test: no bubbles observed.',
      'No metal fragments found in sample cans.',
    ],
    next: 'Proceed to pasteurisation (CCP2) immediately.',
    critical: 'Any leak, seam failure, or metal fragment requires a full batch hold and investigation.',
  },
  ccp2: {
    n: 16, title: 'CCP2 — Pasteurisation',
    what: [
      'Submerge sealed cans fully in a water bath.',
      'Bring the bath to temperature and hold for the full duration.',
      'Monitor and record temperature throughout.',
    ],
    check: [
      'Water bath ≥ 75°C maintained throughout.',
      'Hold time ≥ 10 minutes from when target temp was first reached.',
      'All cans fully submerged throughout.',
    ],
    next: 'Cool cans then carry out can inspection. Apply labels once fully cooled.',
    critical: 'If temperature drops below 75°C or hold time is short, raise a corrective action before releasing any product.',
  },
  inspect: {
    n: 17, title: 'Can inspection',
    what: [
      'Inspect all cans after pasteurisation.',
      'Check ends for swelling — swelling indicates spoilage or over-carbonation.',
      'Check seams and bodies for moisture indicating leakers.',
      'Quarantine any defective cans immediately.',
    ],
    check: [
      'No swollen ends.',
      'No leakers.',
      'Seams undamaged after pasteurisation.',
    ],
    next: 'Apply final labels. Record the storage location and best-before date.',
  },
  label: {
    n: 18, title: 'Labelling & storage',
    what: [
      'Apply labels with the correct lot code, best-before date, and product information.',
      'Move to storage as soon as possible.',
      'Record the storage location for traceability.',
    ],
    check: [
      'Lot code matches the canning run record.',
      'Best-before date calculated correctly.',
      'Labels legible, correctly oriented, and fully adhered.',
    ],
    next: 'HACCP record complete. Batch is archived.',
  },
}

const activeHelp = computed<StageHelp | null>(() => {
  const key = openStage.value != null
    ? STAGE_MAP.find(s => s.n === openStage.value)?.key
    : STAGE_MAP.find(s => !stageIsDone(s.key))?.key
  return key ? (STAGE_HELP[key] ?? null) : null
})

// ── Corrective action drawer ───────────────────────────────
const openActions = computed(() =>
  (correctiveActions.value ?? []).filter(ca => !ca.resolvedAt)
)

function formatCorrectiveDate(ts: { toDate?: () => Date } | null | undefined): string {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Discard batch ─────────────────────────────────────────
const fermentCompleteDialogOpen = ref(false)

async function confirmFermentComplete() {
  const fermentStage = STAGE_MAP.find(s => s.key === 'ferment')!
  fermentCompleteDialogOpen.value = false
  await saveStageClick(fermentStage)
}

const discardDialogOpen = ref(false)
const discardReason = ref('')
const discarding = ref(false)

function openDiscardDialog() {
  discardReason.value = ''
  discardDialogOpen.value = true
}

async function confirmDiscard() {
  if (!discardReason.value.trim() || !authStore.user) return
  discarding.value = true
  try {
    await updateBatch({
      status: 'disposed',
      disposedReason: discardReason.value.trim(),
      disposedAt: serverTimestamp(),
      disposedBy: authStore.user.uid,
    })
    discardDialogOpen.value = false
    uiStore.toast('Batch discarded', 'warn')
  } catch (e) {
    console.error('Discard failed:', e)
    uiStore.toast('Failed to discard batch', 'warn')
  } finally {
    discarding.value = false
  }
}

const correctivePanelOpen = ref(false)
const correctiveForm = reactive({
  ccp: '' as CcpNumber | '',
  deviation: '',
  rootCause: '',
  actionTaken: '',
  productDisposition: '',
  retestResult: '',
})
const correctiveLoading = ref(false)
const correctiveError = ref<string | null>(null)

function openCorrectivePanel(ccp: CcpNumber | '' = '') {
  correctiveForm.ccp = ccp
  correctiveForm.deviation = ''
  correctiveForm.rootCause = ''
  correctiveForm.actionTaken = ''
  correctiveForm.productDisposition = ''
  correctiveForm.retestResult = ''
  correctiveError.value = null
  correctivePanelOpen.value = true
}

async function submitCorrectiveAction() {
  if (!correctiveForm.ccp) return
  correctiveLoading.value = true
  correctiveError.value = null
  try {
    await raiseCorrectiveAction({
      ccp: correctiveForm.ccp as CcpNumber,
      deviation: correctiveForm.deviation,
      rootCause: correctiveForm.rootCause,
      actionTaken: correctiveForm.actionTaken,
      productDisposition: correctiveForm.productDisposition,
      retestResult: correctiveForm.retestResult || undefined,
      userId: authStore.user!.uid,
    })
    uiStore.toast('Corrective action recorded', 'warn')
    correctivePanelOpen.value = false
  } catch {
    correctiveError.value = 'Failed to save. Please try again.'
  } finally {
    correctiveLoading.value = false
  }
}

// ── Log reading drawer ───────────────────────────────────
const logPanelOpen = ref(false)
const logForm = reactive({
  sg: null as number | null,
  tempC: null as number | null,
  day: 0,
  notes: '',
})
const logLoading = ref(false)
const logError = ref<string | null>(null)

const daysSincePitchNum = computed(() => {
  if (!batch.value?.startDate) return 0
  return Math.floor((Date.now() - batch.value.startDate.toDate().getTime()) / 86400000)
})

watch(daysSincePitchNum, d => { logForm.day = d }, { immediate: true })

const isStable = computed(() => {
  const gs = gravityReadings.value
  if (!gs || gs.length < 2) return false
  const last = gs[gs.length - 1]
  const prev = gs[gs.length - 2]
  return Math.abs(last.value - prev.value) < 0.001 && (last.day - prev.day) >= 2
})

async function submitLogReading() {
  if (logForm.sg == null && logForm.tempC == null) return
  logLoading.value = true
  logError.value = null
  try {
    if (logForm.sg != null) {
      await addReading({
        type: 'gravity',
        value: logForm.sg,
        day: logForm.day,
        notes: logForm.notes,
        userId: authStore.user!.uid,
      })
    }
    if (logForm.tempC != null) {
      await addReading({
        type: 'temperature',
        value: logForm.tempC,
        day: logForm.day,
        notes: logForm.sg != null ? '' : logForm.notes,
        userId: authStore.user!.uid,
      })
    }
    uiStore.toast('Reading saved', 'ok')
    logPanelOpen.value = false
    logForm.sg = null
    logForm.tempC = null
    logForm.notes = ''
  } catch {
    logError.value = 'Failed to save reading. Please try again.'
  } finally {
    logLoading.value = false
  }
}

// ── Mid-ferment ingredient addition ───────────────────────
const fermentAddOpen = ref(false)
const fermentAddLoading = ref(false)
const fermentAddError = ref<string | null>(null)
const fermentAdd = reactive({
  ingredientId: '',
  ingredientName: '',
  amount: null as number | null,
  unit: 'g' as import('~/types/ingredient').IngredientUnit,
  day: 0,
  notes: '',
})

watch(daysSincePitchNum, d => { fermentAdd.day = d }, { immediate: true })

function onFermentIngSelect() {
  const ing = ingredients.value.find(i => i.id === fermentAdd.ingredientId)
  if (ing) {
    fermentAdd.ingredientName = ing.name
    fermentAdd.unit = ing.unit
  }
}

async function submitFermentAdd() {
  if (!fermentAdd.ingredientId || !fermentAdd.amount || !authStore.user || !batch.value) return
  fermentAddLoading.value = true
  fermentAddError.value = null
  try {
    await deductIngredients({
      batchId: batchDocId,
      batchRef: batch.value.batchId ?? batchDocId,
      stageKey: 'ferment',
      usages: [{
        ingredientId: fermentAdd.ingredientId,
        ingredientName: fermentAdd.ingredientName,
        quantityUsed: fermentAdd.amount,
        unit: fermentAdd.unit,
        notes: fermentAdd.notes || `Added on fermentation day ${fermentAdd.day}`,
      }],
      userId: authStore.user.uid,
    })
    uiStore.toast(`${fermentAdd.ingredientName} added`, 'ok')
    fermentAddOpen.value = false
    fermentAdd.ingredientId = ''
    fermentAdd.ingredientName = ''
    fermentAdd.amount = null
    fermentAdd.notes = ''
  } catch (e) {
    console.error('Ferment add failed:', e)
    fermentAddError.value = 'Failed to save. Please try again.'
  } finally {
    fermentAddLoading.value = false
  }
}

function formatStageDate(key: string): string {
  const ts = batch.value?.stageData?.[key]?.confirmedAt
  if (!ts?.toDate) return 'recorded'
  return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.batch-detail { max-width: 100%; }

/* ── Page header ── */
.batch-title-row {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 16px; flex-wrap: wrap;
}
.batch-title-left { flex: 1; min-width: 0; }
.batch-title-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; margin-top: 4px; }

.status-chip {
  display: inline-flex;
  align-items: center;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 4px 11px;
  border-radius: 99px;
}
.chip--active, .chip--conditioning { background: rgba(63,208,114,0.13); color: var(--accent-deep); }
.chip--ready_to_can, .chip--canning { background: rgba(28,126,240,0.10); color: var(--blue-deep); }
.chip--complete   { background: rgba(63,208,114,0.13); color: var(--accent-deep); }
.chip--hold, .chip--disposed { background: rgba(255,59,48,0.10); color: var(--red-deep); }

.discard-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--text-quarternary);
  padding: 7px 12px;
  border-radius: var(--r-sm);
  border: 1px solid var(--separator-2);
  background: transparent;
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
  letter-spacing: -0.005em;
}
.discard-btn:hover { background: rgba(255,59,48,0.06); color: var(--red-deep); border-color: rgba(255,59,48,0.22); }
.discard-btn:active { transform: scale(0.98); }

.corrective-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--red-deep);
  padding: 7px 12px;
  border-radius: var(--r-sm);
  border: 1px solid rgba(255,59,48,0.22);
  background: rgba(255,59,48,0.06);
  transition: background var(--t-fast);
  letter-spacing: -0.005em;
}
.corrective-btn:hover { background: rgba(255,59,48,0.12); }
.corrective-btn:active { transform: scale(0.98); }

/* ── Sidebar stats card ── */
.stats-card {
  padding: 0; overflow: hidden;
}
.stats-card-row {
  display: flex; align-items: stretch;
}
.stat-item {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 13px 6px; gap: 5px; flex: 1;
  border-right: 1px solid var(--separator-2);
}
.stat-item:last-child { border-right: none; }
.stat-label {
  font-size: 0.58rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--text-tertiary); white-space: nowrap;
}
.stat-val {
  font-family: var(--font-mono); font-size: 1.12rem; font-weight: 700;
  color: var(--text-primary); letter-spacing: -0.02em; line-height: 1;
}
.stats-sep { height: 1px; background: var(--separator-2); }

/* ── Two-column layout ── */
.stage-layout {
  display: grid;
  grid-template-columns: 1fr 268px;
  gap: 24px;
  align-items: flex-start;
}
.stage-layout:has(.stage-runner-col:only-child) {
  grid-template-columns: 1fr;
}
.stage-runner-col { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
@media (max-width: 860px) {
  .stage-layout { grid-template-columns: 1fr; }
  .help-panel { display: none; }
}

/* ── Phase grouping wrapper ── */
.phase-group {
  border: 1px solid rgba(60,60,67,0.16);
  border-radius: var(--r-lg);
  overflow: hidden;
  background: var(--surface);
  box-shadow: 0 1px 4px rgba(0,0,0,0.07), 0 0.5px 1px rgba(0,0,0,0.04);
  transition: box-shadow var(--t-base);
}
.phase-group--open {
  box-shadow: 0 4px 14px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
}

/* ── Phase headers ── */
.phase-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 18px 12px;
  border-top: 3px solid transparent;
  width: 100%;
  border-style: none none none none;
  border-top-style: solid;
  border-top-color: transparent;
  cursor: pointer;
  text-align: left;
  background: #EFEFED;
  transition: background var(--t-fast);
}
.phase-header:hover { background: #E7E7E5; }
.phase-group--open .phase-header { border-bottom: 1px solid rgba(60,60,67,0.12); }

/* Active phase: stronger tint + left accent bar */
.phase-group--open .phase-header--brew      { background: rgba(255,149,64,0.13);  border-top-color: #FF9640; }
.phase-group--open .phase-header--ferment   { background: rgba(48,168,90,0.12);   border-top-color: #30A85A; }
.phase-group--open .phase-header--condition { background: rgba(90,200,250,0.14);  border-top-color: #5AC8FA; }
.phase-group--open .phase-header--canning   { background: rgba(255,59,48,0.11);   border-top-color: #FF3B30; }
.phase-group--open .phase-header--post      { background: rgba(175,82,222,0.11);  border-top-color: #AF52DE; }

.phase-chevron { color: var(--text-secondary); transition: transform 0.2s var(--ease); flex-shrink: 0; }
.phase-chevron--open { transform: rotate(180deg); }

.phase-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  flex-shrink: 0;
  font-size: 0.9rem;
  line-height: 1;
  background: rgba(0,0,0,0.08);
  transition: background var(--t-fast);
}
.phase-group--open .phase-icon--brew      { background: rgba(255,149,64,0.25); }
.phase-group--open .phase-icon--ferment   { background: rgba(48,168,90,0.22); }
.phase-group--open .phase-icon--condition { background: rgba(90,200,250,0.26); }
.phase-group--open .phase-icon--canning   { background: rgba(255,59,48,0.20); }
.phase-group--open .phase-icon--post      { background: rgba(175,82,222,0.22); }

.phase-title {
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-secondary);
  transition: color var(--t-fast);
}
.phase-group--open .phase-title { color: var(--text-primary); }

.phase-done-badge {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 2px 9px;
  border-radius: 99px;
  background: rgba(48,168,90,0.18);
  color: var(--accent-deep);
}

/* ── Stage runner ── */
.stage-runner { background: #fff; }

/* ── Completed phase summary ── */
.phase-summary {
  display: flex; flex-wrap: wrap; gap: 0;
  background: rgba(48,168,90,0.06);
  border-top: 1px solid rgba(48,168,90,0.18);
}
.phase-summary--with-stages {
  border-bottom: 1px solid rgba(48,168,90,0.18);
}
.phase-stat {
  display: flex; flex-direction: column; gap: 3px;
  padding: 11px 20px;
  border-right: 1px solid rgba(48,168,90,0.14);
}
.phase-stat:last-child { border-right: none; }
.phase-stat-label {
  font-size: 0.58rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.07em; color: var(--accent-deep); white-space: nowrap;
  opacity: 0.75;
}
.phase-stat-value {
  font-family: var(--font-mono); font-size: 0.92rem; font-weight: 700;
  color: var(--text-primary); letter-spacing: -0.02em; line-height: 1;
}

/* Solo phase: hide the redundant stage-row header, show panel directly */
.phase-group--solo .stage-summary { display: none; }
.phase-group--solo .stage-panel { border-top: none; animation: none; }
.phase-group--solo .stage-row { border-bottom: none; }

.phase-solo-summary {
  font-size: 0.74rem; font-family: var(--font-mono);
  color: var(--text-tertiary); letter-spacing: 0;
}

.stage-row { border-bottom: 1px solid var(--separator-2); }
.stage-row:last-child { border-bottom: none; }
.stage-row--ccp { border-left: 3px solid rgba(255,149,64,0.6); }
.stage-row--ccp.stage-row--done { border-left-color: rgba(76,217,123,0.6); }

.stage-summary {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background var(--t-fast);
}
.stage-summary:hover:not(:disabled) { background: rgba(0,0,0,0.018); }
.stage-row--locked .stage-summary { cursor: default; opacity: 0.32; }
.stage-row--done .stage-summary { background: none; }
.stage-row--open > .stage-summary { background: rgba(0,0,0,0.022); }

.stage-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 700;
  transition: background var(--t-base), color var(--t-fast), box-shadow var(--t-base);
}
.num--done {
  background: linear-gradient(145deg, #3FD072, #25A04E);
  color: #fff;
  box-shadow: 0 1px 4px rgba(37,160,78,0.32);
}
.num--next {
  background: var(--text-primary);
  color: var(--surface);
  box-shadow: 0 1px 4px rgba(0,0,0,0.22);
}
.num--locked { background: var(--surface-3); color: var(--text-placeholder); }

.stage-info { flex: 1; min-width: 0; }
.stage-label-row { display: flex; align-items: center; gap: 8px; }
.stage-label { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); }
.stage-row--locked .stage-label { color: var(--text-tertiary); }
.ccp-badge {
  font-size: 0.58rem; font-weight: 800; letter-spacing: 0.05em;
  padding: 2px 7px; border-radius: 4px;
  background: rgba(255,149,64,0.14); color: #B45309;
}
.stage-done-summary {
  font-size: 0.75rem; color: var(--text-tertiary);
  margin-top: 2px; font-family: var(--font-mono); letter-spacing: 0;
}

.stage-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.stage-next-pill {
  font-size: 0.60rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
  padding: 3px 9px; border-radius: 99px;
  background: var(--accent); color: #fff;
  box-shadow: 0 1px 5px rgba(40,168,82,0.3);
}
.stage-chevron { color: var(--text-quarternary); transition: transform 0.2s ease; }
.chevron--open { transform: rotate(180deg); }

/* ── Expanded panel ── */
.stage-panel {
  border-top: 1px solid var(--separator-2);
  background: var(--surface-2);
  animation: panel-slide 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.stage-locked-notice {
  display: flex; align-items: center; gap: 7px;
  font-size: 0.75rem; font-weight: 600; color: #1A6B38;
  background: rgba(76,217,123,0.08);
  border-bottom: 1px solid rgba(76,217,123,0.15);
  padding: 10px 16px;
}
@keyframes panel-slide {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.panel-body { padding: 20px 20px 22px; display: flex; flex-direction: column; gap: 14px; }
.panel-body > .btn-submit { align-self: flex-start; }
.panel-lead { font-size: 0.83rem; color: var(--text-secondary); line-height: 1.55; margin: 0; }
.panel-empty { font-size: 0.82rem; color: var(--text-tertiary); font-style: italic; margin: 0; }
.panel-hint { font-size: 0.76rem; color: var(--text-tertiary); }
.panel-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; padding-top: 6px; }

/* ── Checklist ── */
.checklist {
  display: flex; flex-direction: column;
  border: 1px solid var(--separator-2);
  border-radius: var(--r-sm);
  overflow: hidden;
  background: var(--surface);
}
.checklist-item {
  display: flex; align-items: center; gap: 12px;
  font-size: 0.83rem; color: var(--text-primary);
  padding: 10px 14px;
  cursor: pointer; transition: background var(--t-fast);
  border-bottom: 1px solid var(--separator-2);
}
.checklist-item:last-child { border-bottom: none; }
.checklist-item:hover { background: var(--surface-2); }
.checklist-item input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--accent); flex-shrink: 0; }

/* ── Measurement rows ── */
.recipe-ref {
  display: flex; flex-direction: column;
  border: 1px solid var(--separator-2);
  border-radius: var(--r-sm);
  overflow: hidden;
  background: var(--surface);
}
.recipe-ref-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--separator-2);
}
.recipe-ref-row:last-child { border-bottom: none; }
.recipe-ref-label {
  flex: 1; font-size: 0.83rem; font-weight: 500; color: var(--text-primary);
  min-width: 140px;
}
.meas-input {
  width: 86px !important;
  text-align: right;
  font-family: var(--font-mono);
  font-size: 0.88rem !important;
  padding: 5px 9px !important;
  border-radius: var(--r-sm) !important;
}
.meas-unit { font-size: 0.74rem; color: var(--text-tertiary); width: 30px; text-align: left; }

.checklist-row { background: var(--surface); align-items: center; }
.inline-check { display: flex; align-items: center; gap: 8px; font-size: 0.83rem; cursor: pointer; }
.inline-check input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--accent); }
.inline-radio { display: flex; align-items: center; gap: 14px; font-size: 0.83rem; flex-wrap: wrap; }
.inline-radio label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
.inline-radio input[type="radio"] { accent-color: var(--accent); }

/* ── CCP live result ── */
.ccp-live-result {
  padding: 10px 14px;
  border-radius: var(--r-sm);
  font-size: 0.82rem;
  font-weight: 600;
  display: flex; align-items: center; gap: 8px;
  white-space: nowrap;
}
.result-pass { background: rgba(76,217,123,0.1); color: #1A6B38; border: 1px solid rgba(76,217,123,0.22); }
.result-fail { background: rgba(255,59,48,0.07); color: #C62828; border: 1px solid rgba(255,59,48,0.18); }

.corrective-link {
  font-size: 0.78rem; font-weight: 600; color: #C62828;
  text-decoration: none; padding: 7px 13px;
  border: 1px solid rgba(229,57,53,0.25); border-radius: var(--r-sm);
  background: rgba(229,57,53,0.05);
  transition: background var(--t-fast);
}
.corrective-link:hover { background: rgba(229,57,53,0.1); }

/* ── Fermentation table ── */
.readings-table-wrap {
  overflow-x: auto;
  border-radius: var(--r-sm);
  border: 1px solid var(--separator-2);
  background: var(--surface);
}
.readings-table { width: 100%; border-collapse: collapse; font-size: 0.80rem; }
.readings-table th {
  padding: 8px 14px; text-align: left;
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--text-tertiary); border-bottom: 1px solid var(--separator-2);
  background: var(--surface-2);
}
.readings-table td { padding: 10px 14px; border-bottom: 1px solid var(--separator-2); color: var(--text-primary); }
.readings-table tr:last-child td { border-bottom: none; }
.readings-notes { color: var(--text-tertiary); font-size: 0.75rem; }
.mono { font-family: var(--font-mono); }

/* ── Log reading combined form ── */
.log-readings-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.log-reading-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.log-reading-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

/* ── Help sidebar ── */
.help-panel {
  position: sticky; top: 24px;
  display: flex; flex-direction: column; gap: 12px;
}

.help-card {
  background: var(--surface);
  border: 1px solid rgba(60,60,67,0.16);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07), 0 0.5px 1px rgba(0,0,0,0.04);
}

.help-stage-label {
  display: flex; align-items: center; gap: 10px;
  padding: 13px 16px 12px;
  border-bottom: 1px solid var(--separator-2);
  background: rgba(255,255,255,0.5);
}
.help-stage-num {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 8px;
  background: linear-gradient(145deg, var(--accent), #28A852);
  color: #fff;
  font-size: 0.72rem; font-weight: 700; flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(40,168,82,0.3);
}
.help-stage-title { font-size: 0.80rem; font-weight: 600; color: var(--text-primary); line-height: 1.3; }

.help-section { padding: 13px 16px; border-bottom: 1px solid var(--separator-2); }
.help-section:last-child { border-bottom: none; }
.help-section-heading {
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase;
  color: var(--text-tertiary); margin: 0 0 9px;
}

.help-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.help-list li {
  font-size: 0.79rem; line-height: 1.5; color: var(--text-primary);
  padding-left: 16px; position: relative;
}
.help-list li::before { content: '·'; position: absolute; left: 4px; color: var(--text-quarternary); font-weight: 700; }
.help-list--check li::before {
  content: ''; position: absolute; left: 1px; top: 6px;
  width: 8px; height: 5px;
  border-left: 1.5px solid var(--accent); border-bottom: 1.5px solid var(--accent);
  transform: rotate(-45deg);
}

.help-next-text { font-size: 0.79rem; line-height: 1.55; color: var(--text-secondary); margin: 0; }

.help-critical {
  padding: 10px 14px; margin: 0 12px 12px;
  background: rgba(255,59,48,0.06); border: 1px solid rgba(255,59,48,0.16);
  border-radius: var(--r-sm); font-size: 0.74rem; line-height: 1.5;
  color: #bf3630; font-weight: 500;
  display: flex; gap: 8px; align-items: flex-start;
}

.help-empty {
  background: rgba(255,255,255,0.55);
  -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
  border: 1px solid rgba(0,0,0,0.07); border-radius: var(--r-lg);
  padding: 32px 22px; text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.help-empty-icon { font-size: 2rem; line-height: 1; margin-bottom: 10px; }
.help-empty-text { font-size: 0.79rem; color: var(--text-tertiary); line-height: 1.45; margin: 0; }

.label-opt { font-weight: 400; color: var(--text-tertiary); font-size: 0.75em; }

/* ── Transfer destination callout ── */
.transfer-dest {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 0.83rem; font-weight: 700; color: var(--accent-deep);
  background: var(--accent-tint); border: 1px solid rgba(48,168,90,0.2);
  padding: 9px 14px; border-radius: var(--r-sm);
}

/* ── Slide-over panels ─────────────────────────────── */
.overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.28); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: flex-end;
}
.overlay-enter-active, .overlay-leave-active { transition: opacity 180ms var(--ease); }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

.form-panel {
  width: 520px; max-width: 94vw; height: 100vh;
  background: #fff; display: flex; flex-direction: column;
  box-shadow: var(--shadow-xl);
}
.panel-enter-active { transition: transform 240ms var(--ease-spring); }
.panel-leave-active { transition: transform 180ms var(--ease); }
.panel-enter-from, .panel-leave-to { transform: translateX(100%); }

@media (max-width: 800px) {
  .overlay { align-items: flex-end; justify-content: center; }
  .form-panel {
    width: 100%; max-width: 100%;
    height: auto; max-height: 92dvh;
    border-radius: var(--r-lg) var(--r-lg) 0 0;
    padding-bottom: env(safe-area-inset-bottom);
  }
  .panel-enter-from, .panel-leave-to { transform: translateY(100%); }
  .panel-header::before {
    content: '';
    display: block;
    position: absolute;
    top: 8px; left: 50%; transform: translateX(-50%);
    width: 36px; height: 4px;
    border-radius: 99px;
    background: var(--separator-2);
  }
  .panel-header { position: relative; padding-top: 22px; }
}

.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px 14px; border-bottom: 1px solid var(--separator-2); flex-shrink: 0;
  gap: 12px;
}
.panel-eyebrow {
  font-size: 0.70rem; font-weight: 500; color: var(--text-quarternary);
  letter-spacing: -0.01em; margin-bottom: 2px;
}
.panel-title { font-size: 1.05rem; font-weight: 700; letter-spacing: -0.03em; color: var(--text-primary); }
.panel-close {
  width: 28px; height: 28px; border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-quarternary); transition: background var(--t-fast), color var(--t-fast);
  flex-shrink: 0;
}
.panel-close:hover { background: var(--surface-3); color: var(--text-primary); }
.panel-body-scroll { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.panel-footer {
  padding: 16px 24px; border-top: 1px solid var(--separator-2);
  display: flex; gap: 10px; justify-content: flex-end; flex-shrink: 0;
}

/* Open actions in corrective drawer */
.panel-open-actions {
  border-bottom: 1px solid var(--separator-2);
  background: var(--surface-2);
}
.open-action-card {
  padding: 14px 20px;
  border-bottom: 1px solid var(--separator-2);
  display: flex; flex-direction: column; gap: 5px;
}
.open-action-card:last-child { border-bottom: none; }
.open-action-head {
  display: flex; align-items: center; gap: 10px; margin-bottom: 3px;
}
.open-action-ccp {
  font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700;
  color: #C62828; letter-spacing: 0.04em;
}
.open-action-date {
  font-size: 0.72rem; color: var(--text-quarternary); flex: 1;
}
.open-action-row {
  display: flex; gap: 10px; font-size: 0.80rem; color: var(--text-secondary); line-height: 1.5;
}
.open-action-label {
  font-size: 0.72rem; font-weight: 600; color: var(--text-quarternary);
  min-width: 90px; flex-shrink: 0;
}
.open-action-resolved { color: #1A6B38; }

.ferment-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--separator-2);
  flex-wrap: wrap;
}
.ferment-actions .btn-submit {
  flex-shrink: 0;
  width: auto;
}
.btn-mark-complete {
  margin-left: auto;
  padding: 8px 14px;
  font-size: 0.80rem; font-weight: 600;
  border-radius: var(--r-sm);
  border: 1px solid var(--separator-2);
  background: var(--surface);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
  white-space: nowrap;
  display: inline-flex; align-items: center; gap: 6px;
}
.btn-mark-complete:hover { background: var(--surface-2); color: var(--text-primary); }
.btn-add-ingredient {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.78rem; font-weight: 600;
  padding: 7px 14px; border-radius: var(--r-sm);
  border: 1px solid var(--separator-2); background: var(--surface);
  color: var(--text-secondary);
  transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
}
.btn-add-ingredient:hover { background: var(--accent-tint); border-color: rgba(48,168,90,0.25); color: var(--accent-deep); }

/* ── Canning can runs ── */
.can-allowance {
  background: var(--surface-2);
  border: 1px solid var(--separator-2);
  border-radius: var(--r-sm);
  padding: 12px 14px;
  margin-bottom: 14px;
}
.can-allowance-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
.can-allowance-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-tertiary); }
.can-allowance-value { font-size: 0.82rem; font-weight: 700; color: var(--text-primary); }
.can-allowance-of { font-weight: 400; color: var(--text-tertiary); }
.can-allowance-bar { height: 6px; border-radius: 99px; background: var(--separator-2); overflow: hidden; }
.can-allowance-fill { height: 100%; border-radius: 99px; background: var(--accent); transition: width 0.2s; }
.can-allowance-fill--over { background: #E53E3E; }
.can-allowance-warn { font-size: 0.75rem; color: #C62828; margin: 6px 0 0; }

.can-runs {
  border: 1px solid var(--separator-2);
  border-radius: var(--r-sm);
  overflow: hidden;
}
.can-runs-header {
  display: grid;
  grid-template-columns: 1fr 80px 140px 28px;
  gap: 8px;
  padding: 7px 12px;
  background: var(--surface-2);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}
.can-run-row {
  display: grid;
  grid-template-columns: 1fr 80px 140px 28px;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  border-top: 1px solid var(--separator-2);
}
.can-run-row .field-input { font-size: 0.83rem; padding: 6px 8px; }
.can-run-toggle {
  display: flex;
  border: 1px solid var(--separator-2);
  border-radius: var(--r-xs);
  overflow: hidden;
}
.can-run-toggle-btn {
  flex: 1;
  padding: 5px 0;
  font-size: 0.75rem; font-weight: 600;
  border: none; background: transparent; cursor: pointer;
  color: var(--text-tertiary);
  transition: background var(--t-fast), color var(--t-fast);
}
.can-run-toggle-btn.active { background: rgba(48,168,90,0.12); color: var(--accent-deep); }
.can-run-toggle-btn--defect.active { background: rgba(255,59,48,0.08); color: #C62828; }
.can-run-remove {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: var(--r-xs);
  border: none; background: transparent; cursor: pointer;
  color: var(--text-tertiary);
  transition: background var(--t-fast), color var(--t-fast);
}
.can-run-remove:hover:not(:disabled) { background: rgba(255,59,48,0.08); color: #C62828; }
.can-run-remove:disabled { opacity: 0.3; cursor: default; }
.btn-add-row {
  display: block; width: 100%;
  padding: 9px 12px;
  font-size: 0.78rem; font-weight: 600;
  text-align: left; color: var(--text-secondary);
  background: var(--surface); border: none;
  border-top: 1px solid var(--separator-2);
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
}
.btn-add-row:hover { background: var(--accent-tint); color: var(--accent-deep); }
.can-totals {
  font-size: 0.78rem; color: var(--text-tertiary);
  padding: 8px 2px 0;
  font-weight: 500;
}

/* Discard dialog */
.overlay--center { align-items: center; justify-content: center; }
.discard-dialog {
  background: var(--surface); border-radius: var(--r-lg);
  padding: 28px 24px; width: 400px; max-width: 92vw;
  box-shadow: var(--shadow-xl);
  display: flex; flex-direction: column; gap: 12px;
}
.discard-dialog-icon { display: flex; justify-content: center; margin-bottom: 4px; }
.discard-dialog-title {
  font-size: 1rem; font-weight: 700; color: var(--text-primary);
  text-align: center; letter-spacing: -0.02em;
}
.discard-dialog-sub {
  font-size: 0.80rem; color: var(--text-quarternary);
  text-align: center; line-height: 1.55; margin-bottom: 4px;
}
.discard-dialog-actions {
  display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px;
}
.btn-discard-confirm {
  padding: 9px 18px; border-radius: var(--r-sm);
  background: linear-gradient(145deg, #FF6B6B, #E53935);
  color: #fff; font-size: 0.85rem; font-weight: 600;
  box-shadow: 0 1px 6px rgba(229,57,53,0.25);
  transition: box-shadow var(--t-fast), opacity var(--t-fast);
}
.btn-discard-confirm:hover:not(:disabled) { box-shadow: 0 3px 10px rgba(229,57,53,0.35); }
.btn-discard-confirm:disabled { opacity: 0.45; cursor: not-allowed; }

/* ── Completion summary ──────────────────────────────── */
.completion-summary {
  border: 1px solid rgba(60,60,67,0.16);
  border-radius: var(--r-lg);
  background: var(--surface);
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
}
.cs-header {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 13px 16px;
  width: 100%;
  cursor: pointer;
  background: #EFEFED;
  border: none;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-primary);
  border-bottom: 1px solid rgba(60,60,67,0.12);
  transition: background var(--t-fast);
}
.cs-header:hover { background: #E7E7E5; }
.cs-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  border-bottom: 1px solid var(--separator-2);
}
.cs-stat {
  flex: 1 1 120px;
  padding: 12px 16px;
  border-right: 1px solid var(--separator-2);
}
.cs-stat:last-child { border-right: none; }
.cs-chevron { color: var(--text-tertiary); transition: transform var(--t-fast); flex-shrink: 0; }
.cs-chevron--open { transform: rotate(180deg); }
.cs-stat-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin-bottom: 3px;
}
.cs-stat-val {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}
.cs-phases {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0;
}
.cs-phase {
  padding: 14px 16px;
  border-right: 1px solid var(--separator-2);
  border-bottom: 1px solid var(--separator-2);
}
.cs-phase:last-child { border-right: none; }
.cs-phase--ccp { grid-column: 1 / -1; background: var(--surface-2); }
.cs-phase-title {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin-bottom: 8px;
}
.cs-rows { display: flex; flex-direction: column; gap: 5px; }
.cs-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 0.8rem;
}
.cs-row-label {
  flex-shrink: 0;
  color: var(--text-secondary);
  min-width: 100px;
}
.cs-row-val {
  color: var(--text-primary);
  font-weight: 500;
  flex: 1;
}
.cs-row--ca .cs-row-val { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.cs-ca-disposition {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 99px;
  background: var(--surface-2);
  color: var(--text-secondary);
}
.cs-ca--released { background: rgba(48,168,90,0.12); color: var(--accent-deep); }
.cs-ca--disposed { background: rgba(229,57,53,0.1); color: #C62828; }
.cs-ca--hold { background: rgba(255,152,0,0.12); color: #E65100; }
.cs-ca--re-pasteurised { background: rgba(33,150,243,0.1); color: #1565C0; }

/* ── Responsive ─────────────────────────────────────── */
@media (max-width: 800px) {
  .stage-layout { gap: 12px; }
  .phase-group { border-radius: var(--r-md); }

  /* Header — status chip inline, action buttons compact */
  .page-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
    margin-top: 10px;
  }
  .page-actions .status-chip { order: -1; }
  .discard-btn, .corrective-btn {
    font-size: 0.72rem;
    padding: 6px 10px;
  }
  .discard-btn span, .corrective-btn span { display: none; }

  /* Phase header — tighter */
  .phase-header { padding: 10px 14px 10px; }
  .phase-icon { width: 24px; height: 24px; border-radius: 6px; }
  .phase-title { font-size: 0.72rem; }

  /* Stage rows — tighter */
  .stage-summary { padding: 12px 14px; gap: 10px; }
  .stage-num { width: 24px; height: 24px; font-size: 0.68rem; }
  .stage-label { font-size: 0.84rem; }
  .panel-body { padding: 14px 14px 16px; }

  /* Phase summary stats — smaller */
  .phase-stat { padding: 9px 14px; }
  .phase-stat-value { font-size: 0.84rem; }

  /* Fermentation buttons — compact row */
  .ferment-actions {
    padding: 10px 14px;
    flex-wrap: nowrap;
    gap: 6px;
  }
  .ferment-actions .btn-submit {
    font-size: 0.78rem;
    padding: 8px 12px;
    flex-shrink: 0;
  }
  .btn-add-ingredient {
    font-size: 0.75rem;
    padding: 7px 10px;
    flex-shrink: 0;
  }
  .btn-mark-complete {
    font-size: 0.75rem;
    padding: 7px 10px;
    flex-shrink: 0;
  }

  /* Stats card — smaller values */
  .stat-val { font-size: 0.95rem; }
  .stat-label { font-size: 0.52rem; }
  .stat-item { padding: 10px 4px; }
}
</style>
