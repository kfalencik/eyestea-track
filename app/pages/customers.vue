<template>
  <div class="customers-page">

    <div class="page-header">
      <div>
        <p class="page-eyebrow">Sales</p>
        <h1 class="page-title">Customers</h1>
      </div>
      <button class="btn-new" @click="openNew()">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M6.5 1.5v10M1.5 6.5h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
        Add customer
      </button>
    </div>

    <!-- Customer grid -->
    <div v-if="customers?.length" class="customer-grid">
      <div
        v-for="c in customers"
        :key="c.id"
        class="customer-card"
        :class="{ 'customer-card--review': needsReview(c) }"
        @click="openDetail(c)"
      >
        <div class="card-top">
          <div class="customer-avatar" :class="`avatar--${typeColor(c.type)}`">
            {{ initials(c.name) }}
          </div>
          <div class="card-badges">
            <span class="status-badge" :class="`status-badge--${typeColor(c.type)}`">
              {{ typeLabel(c.type) }}
            </span>
            <span v-if="needsReview(c)" class="status-badge status-badge--amber customer-review-badge">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M4.5 1v3.5l2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                <circle cx="4.5" cy="4.5" r="3.8" stroke="currentColor" stroke-width="1.1"/>
              </svg>
              Review due
            </span>
          </div>
        </div>

        <div class="card-body">
          <div class="customer-name">{{ c.name }}</div>
          <div v-if="c.company && c.company !== c.name" class="customer-company">{{ c.company }}</div>
          <div v-if="c.contactName" class="customer-contact">{{ c.contactName }}</div>
        </div>

        <div class="card-footer">
          <div v-if="c.address?.city || c.address?.postcode" class="info-row">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1C3.34 1 2 2.34 2 4c0 2.3 3 5 3 5s3-2.7 3-5c0-1.66-1.34-3-3-3z" stroke="currentColor" stroke-width="1.1"/>
              <circle cx="5" cy="4" r="1" fill="currentColor"/>
            </svg>
            <span>{{ [c.address?.city, c.address?.postcode].filter(Boolean).join(', ') }}</span>
          </div>
          <div v-if="c.awrsUrn" class="info-row">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="1" y="1" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.1"/>
              <path d="M3 5h4M3 3.5h2.5M3 6.5h3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
            </svg>
            <span class="mono-sm">{{ c.awrsUrn }}</span>
          </div>
          <div v-if="c.vatNumber" class="info-row">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 7.5l7-7M3 3h4M5 5l2 2" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
            </svg>
            <span>VAT {{ c.vatNumber }}</span>
          </div>
          <div class="card-footer-row">
            <span class="order-count">{{ orderCountFor(c.id) }} {{ orderCountFor(c.id) === 1 ? 'order' : 'orders' }}</span>
            <span v-if="c.idNextReviewDate" class="review-date" :class="{ 'review-date--overdue': isOverdue(c.idNextReviewDate) }">
              Review {{ formatShortDate(c.idNextReviewDate) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="14" r="7" stroke="currentColor" stroke-width="1.6"/>
          <path d="M6 34c0-7.7 6.3-14 14-14s14 6.3 14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="empty-title">No customers yet</p>
      <p class="empty-sub">Add your first customer to keep AWRS-compliant records and track orders.</p>
      <button class="btn-new" @click="openNew()">Add first customer</button>
    </div>

    <!-- ══════════════════════════════════════════════════════
         DETAIL PANEL (view + tabs)
    ══════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="detailOpen" class="overlay" @click.self="closeDetail()">
          <Transition name="panel">
            <div v-if="detailOpen" class="detail-panel">

              <div class="panel-header">
                <div class="panel-header-left">
                  <div class="panel-avatar" :class="`avatar--${typeColor(detailCustomer?.type)}`">
                    {{ initials(detailCustomer?.name ?? '') }}
                  </div>
                  <div>
                    <div class="panel-name">{{ detailCustomer?.name }}</div>
                    <div class="panel-company">{{ detailCustomer?.company }}</div>
                  </div>
                </div>
                <div class="panel-header-actions">
                  <button class="btn-icon" title="Edit" @click="openEdit(detailCustomer!)">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M8.5 2.5l2 2-6.5 6.5H2.5v-2L8.5 2.5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button class="btn-icon btn-icon--danger" title="Delete" @click="promptDelete(detailCustomer!)">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2 3.5h9M5 3.5V2.5h3v1M5.5 5.5v4M7.5 5.5v4M3.5 3.5l.5 7h5l.5-7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button class="panel-close" @click="closeDetail()">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Tabs -->
              <div class="panel-tabs">
                <button
                  v-for="tab in ['Details', 'Due Diligence']"
                  :key="tab"
                  class="panel-tab"
                  :class="{ 'panel-tab--active': activeTab === tab }"
                  @click="activeTab = tab"
                >
                  {{ tab }}
                  <span v-if="tab === 'Due Diligence' && ddEntries?.length" class="tab-count">
                    {{ ddEntries.length }}
                  </span>
                </button>
              </div>

              <!-- ── Details tab ── -->
              <div v-if="activeTab === 'Details'" class="panel-body">

                <div class="detail-section">
                  <div class="detail-section-label">Regulatory</div>
                  <div class="detail-grid">
                    <div class="detail-row">
                      <span class="detail-key">Customer type</span>
                      <span class="detail-val">
                        <span class="status-badge" :class="`status-badge--${typeColor(detailCustomer?.type)}`">
                          {{ typeLabel(detailCustomer?.type) }}
                        </span>
                      </span>
                    </div>
                    <div v-if="detailCustomer?.companyRegNumber" class="detail-row">
                      <span class="detail-key">Company reg.</span>
                      <span class="detail-val mono-sm">{{ detailCustomer.companyRegNumber }}</span>
                    </div>
                    <div v-if="detailCustomer?.vatNumber" class="detail-row">
                      <span class="detail-key">VAT number</span>
                      <span class="detail-val mono-sm">{{ detailCustomer.vatNumber }}</span>
                    </div>
                    <div v-if="detailCustomer?.awrsUrn" class="detail-row">
                      <span class="detail-key">AWRS URN</span>
                      <span class="detail-val mono-sm">{{ detailCustomer.awrsUrn }}</span>
                    </div>
                    <div v-if="detailCustomer?.premisesLicenceNumber" class="detail-row">
                      <span class="detail-key">Premises licence</span>
                      <span class="detail-val mono-sm">{{ detailCustomer.premisesLicenceNumber }}</span>
                    </div>
                    <div v-if="detailCustomer?.personalLicenceHolder" class="detail-row">
                      <span class="detail-key">Personal licence holder</span>
                      <span class="detail-val">{{ detailCustomer.personalLicenceHolder }}</span>
                    </div>
                    <div v-if="detailCustomer?.idVerifiedDate" class="detail-row">
                      <span class="detail-key">ID verified</span>
                      <span class="detail-val">{{ formatShortDate(detailCustomer.idVerifiedDate) }}</span>
                    </div>
                    <div v-if="detailCustomer?.idNextReviewDate" class="detail-row">
                      <span class="detail-key">Next review</span>
                      <span class="detail-val" :class="{ 'text-red': isOverdue(detailCustomer.idNextReviewDate) }">
                        {{ formatShortDate(detailCustomer.idNextReviewDate) }}
                        <span v-if="isOverdue(detailCustomer.idNextReviewDate)" class="overdue-chip">Overdue</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div class="detail-section">
                  <div class="detail-section-label">Contact</div>
                  <div class="detail-grid">
                    <div v-if="detailCustomer?.contactName" class="detail-row">
                      <span class="detail-key">Contact</span>
                      <span class="detail-val">{{ detailCustomer.contactName }}</span>
                    </div>
                    <div v-if="detailCustomer?.email" class="detail-row">
                      <span class="detail-key">Email</span>
                      <a :href="`mailto:${detailCustomer.email}`" class="detail-val detail-link">{{ detailCustomer.email }}</a>
                    </div>
                    <div v-if="detailCustomer?.phone" class="detail-row">
                      <span class="detail-key">Phone</span>
                      <a :href="`tel:${detailCustomer.phone}`" class="detail-val detail-link">{{ detailCustomer.phone }}</a>
                    </div>
                  </div>
                </div>

                <div v-if="hasAddress(detailCustomer)" class="detail-section">
                  <div class="detail-section-label">Delivery address</div>
                  <div class="address-block">
                    <div v-if="detailCustomer?.address?.line1">{{ detailCustomer.address.line1 }}</div>
                    <div v-if="detailCustomer?.address?.line2">{{ detailCustomer.address.line2 }}</div>
                    <div>{{ [detailCustomer?.address?.city, detailCustomer?.address?.county].filter(Boolean).join(', ') }}</div>
                    <div v-if="detailCustomer?.address?.postcode">{{ detailCustomer.address.postcode }}</div>
                    <div v-if="detailCustomer?.address?.country">{{ detailCustomer.address.country }}</div>
                  </div>
                </div>

                <div class="detail-section">
                  <div class="detail-section-label">Commercial</div>
                  <div class="detail-grid">
                    <div class="detail-row">
                      <span class="detail-key">Payment terms</span>
                      <span class="detail-val">
                        {{ detailCustomer?.paymentTermsDays ? `${detailCustomer.paymentTermsDays} days` : 'Pro-forma' }}
                      </span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-key">Credit limit</span>
                      <span class="detail-val">
                        {{ detailCustomer?.creditLimitGbp ? `£${detailCustomer.creditLimitGbp.toLocaleString()}` : 'None / pro-forma' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div v-if="detailCustomer?.notes" class="detail-section">
                  <div class="detail-section-label">Notes</div>
                  <p class="notes-text">{{ detailCustomer.notes }}</p>
                </div>

              </div>

              <!-- ── Due Diligence tab ── -->
              <div v-else class="panel-body">

                <div class="dd-header">
                  <p class="dd-intro">
                    HMRC requires a dated audit trail of every check. Records must be kept for 6 years.
                  </p>
                  <button class="btn-dd-add" @click="openDdForm()">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                    </svg>
                    Log check
                  </button>
                </div>

                <div v-if="ddFormOpen" class="dd-form">
                  <div class="dd-form-title">New due diligence entry</div>

                  <div class="field-row">
                    <div class="field">
                      <label class="field-label">Check method</label>
                      <select v-model="ddForm.method" class="field-input">
                        <option value="online_hmrc">Online — HMRC portal</option>
                        <option value="document_review">Document review</option>
                        <option value="site_visit">Site visit</option>
                        <option value="phone">Phone verification</option>
                      </select>
                    </div>
                    <div class="field">
                      <label class="field-label">AWRS status</label>
                      <select v-model="ddForm.awrsStatus" class="field-input">
                        <option value="not_applicable">N/A</option>
                        <option value="approved">Approved</option>
                        <option value="not_approved">Not approved</option>
                      </select>
                    </div>
                  </div>

                  <div class="field-row">
                    <div class="field">
                      <label class="field-label">Premises licence</label>
                      <select v-model="ddForm.licenceStatus" class="field-input">
                        <option value="not_applicable">N/A</option>
                        <option value="valid">Valid</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                    <div class="field">
                      <label class="field-label">Next review date</label>
                      <input v-model="ddForm.nextReviewDate" type="date" class="field-input" />
                    </div>
                  </div>

                  <div class="field">
                    <label class="field-label">ID documents verified</label>
                    <div class="toggle-row">
                      <button
                        class="toggle-btn"
                        :class="{ 'toggle-btn--on': ddForm.idVerified === true }"
                        @click="ddForm.idVerified = true"
                      >Yes</button>
                      <button
                        class="toggle-btn"
                        :class="{ 'toggle-btn--on': ddForm.idVerified === false }"
                        @click="ddForm.idVerified = false"
                      >No</button>
                      <button
                        class="toggle-btn"
                        :class="{ 'toggle-btn--on': ddForm.idVerified === undefined }"
                        @click="ddForm.idVerified = undefined"
                      >N/A</button>
                    </div>
                  </div>

                  <div class="field">
                    <label class="field-label">Notes</label>
                    <textarea v-model="ddForm.notes" class="field-input field-textarea" rows="2" placeholder="What was checked, reference numbers, outcome…" />
                  </div>

                  <div class="dd-form-actions">
                    <button class="btn-cancel" @click="ddFormOpen = false">Cancel</button>
                    <button class="btn-submit" :disabled="ddSaving" @click="submitDd()">
                      {{ ddSaving ? 'Saving…' : 'Save entry' }}
                    </button>
                  </div>
                </div>

                <div v-if="ddEntries?.length" class="dd-list">
                  <div v-for="entry in ddEntries" :key="entry.id" class="dd-entry">
                    <div class="dd-entry-top">
                      <div class="dd-entry-date">{{ formatTs(entry.checkedAt) }}</div>
                      <div class="dd-chips">
                        <span v-if="entry.awrsStatus && entry.awrsStatus !== 'not_applicable'" class="dd-chip" :class="`dd-chip--${entry.awrsStatus === 'approved' ? 'ok' : 'fail'}`">
                          AWRS {{ entry.awrsStatus === 'approved' ? 'approved' : 'not approved' }}
                        </span>
                        <span v-if="entry.licenceStatus && entry.licenceStatus !== 'not_applicable'" class="dd-chip" :class="`dd-chip--${entry.licenceStatus === 'valid' ? 'ok' : 'fail'}`">
                          Licence {{ entry.licenceStatus }}
                        </span>
                        <span v-if="entry.idVerified === true" class="dd-chip dd-chip--ok">ID verified</span>
                        <span v-if="entry.idVerified === false" class="dd-chip dd-chip--fail">ID not verified</span>
                      </div>
                      <button class="dd-delete" title="Remove entry" @click="removeDdEntry(entry.id)">
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                        </svg>
                      </button>
                    </div>
                    <div class="dd-method">{{ methodLabel(entry.method) }}</div>
                    <div v-if="entry.notes" class="dd-notes">{{ entry.notes }}</div>
                    <div v-if="entry.nextReviewDate" class="dd-review">
                      Next review: {{ formatShortDate(entry.nextReviewDate) }}
                    </div>
                  </div>
                </div>

                <div v-else-if="!ddFormOpen" class="dd-empty">
                  No due diligence entries yet. Log your first check above.
                </div>

              </div>

            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════════════════════════════════════════════
         EDIT FORM PANEL
    ══════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="formOpen" class="overlay overlay--front" @click.self="closeForm()">
          <Transition name="panel">
            <div v-if="formOpen" class="form-panel">

              <div class="panel-header">
                <h2 class="panel-title">{{ editingId ? 'Edit customer' : 'New customer' }}</h2>
                <button class="panel-close" @click="closeForm()">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>

              <div class="panel-body">

                <!-- Identity -->
                <div class="field-group-label">Identity</div>

                <div class="field">
                  <label class="field-label">Customer type <span class="req">*</span></label>
                  <div class="type-selector">
                    <button
                      v-for="opt in typeOptions"
                      :key="opt.value"
                      class="type-opt"
                      :class="{ 'type-opt--active': form.type === opt.value }"
                      @click="form.type = opt.value"
                    >{{ opt.label }}</button>
                  </div>
                </div>

                <div class="field-row">
                  <div class="field">
                    <label class="field-label">Trading name <span class="req">*</span></label>
                    <input v-model="form.name" type="text" class="field-input" placeholder="e.g. The Tap Room" autofocus />
                  </div>
                  <div class="field">
                    <label class="field-label">Legal company name</label>
                    <input v-model="form.company" type="text" class="field-input" placeholder="Same if identical" />
                  </div>
                </div>

                <!-- Regulatory -->
                <div class="field-group-label">Regulatory</div>

                <div class="field-row">
                  <div class="field">
                    <label class="field-label">Company reg. number</label>
                    <input v-model="form.companyRegNumber" type="text" class="field-input" placeholder="12345678" />
                  </div>
                  <div class="field">
                    <label class="field-label">VAT number</label>
                    <input v-model="form.vatNumber" type="text" class="field-input" placeholder="GB 123 4567 89" />
                  </div>
                </div>

                <div v-if="form.type === 'wholesaler'" class="field">
                  <label class="field-label">AWRS URN</label>
                  <input v-model="form.awrsUrn" type="text" class="field-input" placeholder="XXAW00000123456" />
                  <span class="field-hint">Required for all wholesale customers — must be verified before first sale.</span>
                </div>

                <div v-if="form.type === 'licensed_retailer'" class="field-row">
                  <div class="field">
                    <label class="field-label">Premises licence no.</label>
                    <input v-model="form.premisesLicenceNumber" type="text" class="field-input" placeholder="Licence number" />
                  </div>
                  <div class="field">
                    <label class="field-label">Personal licence holder</label>
                    <input v-model="form.personalLicenceHolder" type="text" class="field-input" placeholder="Full name" />
                  </div>
                </div>

                <div class="field-row">
                  <div class="field">
                    <label class="field-label">ID verified date</label>
                    <input v-model="form.idVerifiedDate" type="date" class="field-input" />
                  </div>
                  <div class="field">
                    <label class="field-label">Next review date</label>
                    <input v-model="form.idNextReviewDate" type="date" class="field-input" />
                  </div>
                </div>

                <!-- Contact -->
                <div class="field-group-label">Contact</div>

                <div class="field">
                  <label class="field-label">Contact person</label>
                  <input v-model="form.contactName" type="text" class="field-input" placeholder="Full name" />
                </div>

                <div class="field-row">
                  <div class="field">
                    <label class="field-label">Email</label>
                    <input v-model="form.email" type="email" class="field-input" placeholder="orders@example.com" />
                  </div>
                  <div class="field">
                    <label class="field-label">Phone</label>
                    <input v-model="form.phone" type="tel" class="field-input" placeholder="+44 …" />
                  </div>
                </div>

                <!-- Delivery address -->
                <div class="field-group-label">Delivery address</div>

                <div class="field">
                  <label class="field-label">Address line 1</label>
                  <input v-model="form.address.line1" type="text" class="field-input" placeholder="Street or building" />
                </div>
                <div class="field">
                  <label class="field-label">Address line 2 <span class="label-opt">(optional)</span></label>
                  <input v-model="form.address.line2" type="text" class="field-input" placeholder="Unit, floor, etc." />
                </div>

                <div class="field-row field-row--3">
                  <div class="field">
                    <label class="field-label">City</label>
                    <input v-model="form.address.city" type="text" class="field-input" placeholder="City" />
                  </div>
                  <div class="field">
                    <label class="field-label">County</label>
                    <input v-model="form.address.county" type="text" class="field-input" placeholder="County" />
                  </div>
                  <div class="field">
                    <label class="field-label">Postcode</label>
                    <input v-model="form.address.postcode" type="text" class="field-input" placeholder="AB1 2CD" />
                  </div>
                </div>

                <div class="field">
                  <label class="field-label">Country</label>
                  <input v-model="form.address.country" type="text" class="field-input" placeholder="United Kingdom" />
                </div>

                <!-- Commercial -->
                <div class="field-group-label">Commercial</div>

                <div class="field-row">
                  <div class="field">
                    <label class="field-label">Payment terms (days)</label>
                    <input v-model.number="form.paymentTermsDays" type="number" min="0" class="field-input" placeholder="30" />
                    <span class="field-hint">0 = pro-forma / payment on order</span>
                  </div>
                  <div class="field">
                    <label class="field-label">Credit limit (£)</label>
                    <input v-model.number="form.creditLimitGbp" type="number" min="0" class="field-input" placeholder="0" />
                    <span class="field-hint">0 = no credit / pro-forma</span>
                  </div>
                </div>

                <!-- Notes -->
                <div class="field-group-label">Notes</div>
                <div class="field">
                  <textarea v-model="form.notes" class="field-input field-textarea" rows="3" placeholder="Preferred delivery days, account terms, special requirements…" />
                </div>

                <div v-if="formError" class="form-error">{{ formError }}</div>

              </div>

              <div class="panel-footer">
                <button class="btn-cancel" @click="closeForm()">Cancel</button>
                <button
                  class="btn-submit"
                  :disabled="!form.name.trim() || saving"
                  @click="submitForm()"
                >
                  {{ saving ? 'Saving…' : editingId ? 'Save changes' : 'Add customer' }}
                </button>
              </div>

            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Delete confirmation ── -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="deletingCustomer" class="overlay overlay--front" @click.self="deletingCustomer = null">
          <div class="confirm-dialog">
            <div class="confirm-icon confirm-icon--red">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M8 5V3.5h4V5M8.5 8v6M11.5 8v6M4.5 5l1 12h9l1-12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="confirm-title">Delete {{ deletingCustomer.name }}?</p>
            <p class="confirm-sub">Removes the customer record and all due diligence entries. Existing orders are not affected.</p>
            <div class="confirm-actions">
              <button class="btn-cancel" @click="deletingCustomer = null">Cancel</button>
              <button class="btn-delete" :disabled="deleting" @click="doDelete()">
                {{ deleting ? 'Deleting…' : 'Delete customer' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import type { Customer, DueDiligenceEntry, CustomerType } from '~/types/customer'
import {
  useCustomers, createCustomer, updateCustomer, deleteCustomer,
  useDueDiligence, addDueDiligenceEntry, deleteDueDiligenceEntry,
} from '~/composables/useCustomers'
import { useOrders } from '~/composables/useOrders'
import type { Timestamp } from 'firebase/firestore'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const uiStore = useUiStore()

const { customers } = useCustomers()
const { orders } = useOrders()

const orderCountFor = (customerId: string) =>
  (orders.value ?? []).filter(o => o.customerId === customerId).length

// ── Type helpers ───────────────────────────────────────────
const typeOptions = [
  { value: 'licensed_retailer', label: 'Licensed retailer' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'other', label: 'Other' },
]
function typeLabel(t?: CustomerType) {
  return typeOptions.find(o => o.value === t)?.label ?? 'Other'
}
function typeColor(t?: CustomerType) {
  if (t === 'licensed_retailer') return 'blue'
  if (t === 'wholesaler') return 'indigo'
  return 'grey'
}

// ── Detail panel ───────────────────────────────────────────
const detailOpen = ref(false)
const detailCustomer = ref<Customer | null>(null)
const activeTab = ref('Details')

const { entries: ddEntries } = useDueDiligence(
  computed(() => detailCustomer.value?.id ?? '')
)

function openDetail(c: Customer) {
  detailCustomer.value = c
  activeTab.value = 'Details'
  detailOpen.value = true
}
function closeDetail() {
  detailOpen.value = false
}

// ── DD form ────────────────────────────────────────────────
const ddFormOpen = ref(false)
const ddSaving = ref(false)
const ddForm = reactive({
  method: 'online_hmrc' as DueDiligenceEntry['method'],
  awrsStatus: 'not_applicable' as DueDiligenceEntry['awrsStatus'],
  licenceStatus: 'not_applicable' as DueDiligenceEntry['licenceStatus'],
  idVerified: undefined as boolean | undefined,
  nextReviewDate: '',
  notes: '',
})

function openDdForm() {
  ddForm.method = 'online_hmrc'
  ddForm.awrsStatus = 'not_applicable'
  ddForm.licenceStatus = 'not_applicable'
  ddForm.idVerified = undefined
  ddForm.nextReviewDate = ''
  ddForm.notes = ''
  ddFormOpen.value = true
}

async function submitDd() {
  if (!detailCustomer.value || !authStore.user) return
  ddSaving.value = true
  try {
    await addDueDiligenceEntry(detailCustomer.value.id, {
      method: ddForm.method,
      awrsStatus: ddForm.awrsStatus,
      licenceStatus: ddForm.licenceStatus,
      idVerified: ddForm.idVerified,
      nextReviewDate: ddForm.nextReviewDate || undefined,
      notes: ddForm.notes,
      userId: authStore.user.uid,
    })
    uiStore.toast('Due diligence entry logged', 'ok')
    ddFormOpen.value = false
  } catch {
    uiStore.toast('Failed to save entry', 'error')
  } finally {
    ddSaving.value = false
  }
}

async function removeDdEntry(entryId: string) {
  if (!detailCustomer.value) return
  await deleteDueDiligenceEntry(detailCustomer.value.id, entryId)
  uiStore.toast('Entry removed', 'ok')
}

// ── Edit form ──────────────────────────────────────────────
const formOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const formError = ref<string | null>(null)

function blankForm() {
  return {
    name: '', company: '', type: 'licensed_retailer' as CustomerType,
    companyRegNumber: '', vatNumber: '', awrsUrn: '',
    premisesLicenceNumber: '', personalLicenceHolder: '',
    idVerifiedDate: '', idNextReviewDate: '',
    contactName: '', email: '', phone: '',
    address: { line1: '', line2: '', city: '', county: '', postcode: '', country: 'United Kingdom' },
    paymentTermsDays: 30, creditLimitGbp: 0,
    notes: '',
  }
}
const form = reactive(blankForm())

function openNew() {
  editingId.value = null
  Object.assign(form, blankForm())
  formError.value = null
  formOpen.value = true
}

function openEdit(c: Customer) {
  editingId.value = c.id
  form.name = c.name
  form.company = c.company ?? ''
  form.type = c.type ?? 'other'
  form.companyRegNumber = c.companyRegNumber ?? ''
  form.vatNumber = c.vatNumber ?? ''
  form.awrsUrn = c.awrsUrn ?? ''
  form.premisesLicenceNumber = c.premisesLicenceNumber ?? ''
  form.personalLicenceHolder = c.personalLicenceHolder ?? ''
  form.idVerifiedDate = c.idVerifiedDate ?? ''
  form.idNextReviewDate = c.idNextReviewDate ?? ''
  form.contactName = c.contactName ?? ''
  form.email = c.email ?? ''
  form.phone = c.phone ?? ''
  form.address = {
    line1: c.address?.line1 ?? '', line2: c.address?.line2 ?? '',
    city: c.address?.city ?? '', county: c.address?.county ?? '',
    postcode: c.address?.postcode ?? '', country: c.address?.country ?? 'United Kingdom',
  }
  form.paymentTermsDays = c.paymentTermsDays ?? 30
  form.creditLimitGbp = c.creditLimitGbp ?? 0
  form.notes = c.notes ?? ''
  formError.value = null
  formOpen.value = true
}

function closeForm() { formOpen.value = false }

async function submitForm() {
  if (!form.name.trim() || !authStore.user) return
  saving.value = true
  formError.value = null
  try {
    const payload = {
      name: form.name.trim(),
      company: form.company.trim() || form.name.trim(),
      type: form.type,
      companyRegNumber: form.companyRegNumber.trim(),
      vatNumber: form.vatNumber.trim(),
      awrsUrn: form.awrsUrn.trim(),
      premisesLicenceNumber: form.premisesLicenceNumber.trim(),
      personalLicenceHolder: form.personalLicenceHolder.trim(),
      idVerifiedDate: form.idVerifiedDate,
      idNextReviewDate: form.idNextReviewDate,
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: { ...form.address },
      paymentTermsDays: form.paymentTermsDays,
      creditLimitGbp: form.creditLimitGbp,
      notes: form.notes.trim(),
    }
    if (editingId.value) {
      await updateCustomer(editingId.value, payload)
      if (detailCustomer.value?.id === editingId.value) {
        detailCustomer.value = { ...detailCustomer.value, ...payload }
      }
      uiStore.toast('Customer updated', 'ok')
    } else {
      await createCustomer({ ...payload, userId: authStore.user.uid })
      uiStore.toast(`${form.name} added`, 'ok')
    }
    closeForm()
  } catch {
    formError.value = 'Something went wrong. Please try again.'
  } finally {
    saving.value = false
  }
}

// ── Delete ─────────────────────────────────────────────────
const deletingCustomer = ref<Customer | null>(null)
const deleting = ref(false)

function promptDelete(c: Customer) {
  deletingCustomer.value = c
}

async function doDelete() {
  if (!deletingCustomer.value) return
  deleting.value = true
  try {
    await deleteCustomer(deletingCustomer.value.id)
    uiStore.toast(`${deletingCustomer.value.name} removed`, 'ok')
    deletingCustomer.value = null
    closeDetail()
  } catch {
    uiStore.toast('Failed to delete customer', 'error')
  } finally {
    deleting.value = false
  }
}

// ── Date helpers ───────────────────────────────────────────
const TODAY = new Date().toISOString().slice(0, 10)

function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false
  return dateStr < TODAY
}

function needsReview(c: Customer): boolean {
  return !!c.idNextReviewDate && c.idNextReviewDate <= TODAY
}

function hasAddress(c: Customer | null): boolean {
  if (!c?.address) return false
  return !!(c.address.line1 || c.address.city || c.address.postcode)
}

function formatShortDate(dateStr?: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTs(ts: Timestamp | null | undefined): string {
  if (!ts?.toDate) return '—'
  return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function methodLabel(m: DueDiligenceEntry['method']): string {
  const map: Record<string, string> = {
    online_hmrc: 'Online — HMRC portal',
    document_review: 'Document review',
    site_visit: 'Site visit',
    phone: 'Phone verification',
  }
  return map[m] ?? m
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
</script>

<style scoped>
.customers-page { display: flex; flex-direction: column; gap: 28px; }

.page-eyebrow {
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em;
  text-transform: uppercase; color: var(--accent-deep); margin-bottom: 4px;
}
.page-title { font-size: 1.85rem; font-weight: 700; letter-spacing: -0.04em; color: var(--text-primary); line-height: 1; }

/* Grid */
.customer-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 14px; }

.customer-card {
  background: var(--surface); border: 1px solid var(--separator-2);
  border-radius: var(--r-lg); padding: 18px;
  display: flex; flex-direction: column; gap: 12px;
  cursor: pointer;
  transition: box-shadow var(--t-fast), border-color var(--t-fast), transform var(--t-fast) var(--ease-spring);
}
.customer-card:hover { border-color: var(--accent); box-shadow: 0 4px 16px rgba(40,168,82,0.10); transform: translateY(-1px); }
.customer-card--review { border-color: rgba(255,159,10,0.4); }
.customer-card--review:hover { border-color: rgba(255,159,10,0.7); box-shadow: 0 4px 16px rgba(255,159,10,0.12); }

.card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }

.customer-avatar {
  width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.78rem; font-weight: 700; color: #fff; letter-spacing: 0.03em;
}
.avatar--blue   { background: linear-gradient(145deg, #4A9EFF, #1C7EF0); box-shadow: 0 2px 8px rgba(28,126,240,0.25); }
.avatar--indigo { background: linear-gradient(145deg, #7D6EF0, #5147D4); box-shadow: 0 2px 8px rgba(81,71,212,0.25); }
.avatar--grey   { background: linear-gradient(145deg, #8E8E93, #636366); box-shadow: 0 2px 8px rgba(100,100,100,0.2); }

.card-badges { display: flex; flex-wrap: wrap; gap: 4px; }

.type-badge {
  font-size: 0.60rem; font-weight: 700; letter-spacing: 0.04em;
  padding: 2px 7px; border-radius: 99px; text-transform: uppercase;
}
.type-badge--blue   { background: rgba(28,126,240,0.10); color: #1C5EBF; }
.type-badge--indigo { background: rgba(81,71,212,0.10); color: #3D31B0; }
.type-badge--grey   { background: var(--surface-3); color: var(--text-quarternary); }

.review-badge {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 0.60rem; font-weight: 700; letter-spacing: 0.04em;
  padding: 2px 7px; border-radius: 99px; text-transform: uppercase;
  background: rgba(255,159,10,0.12); color: #B86B00;
}

.card-body { display: flex; flex-direction: column; gap: 2px; }
.customer-name { font-size: 0.95rem; font-weight: 700; letter-spacing: -0.03em; color: var(--text-primary); }
.customer-company { font-size: 0.75rem; color: var(--text-quarternary); }
.customer-contact { font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px; }

.card-footer { display: flex; flex-direction: column; gap: 4px; }
.info-row {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.70rem; color: var(--text-quarternary);
}
.info-row svg { flex-shrink: 0; color: var(--text-placeholder); }
.info-row span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.card-footer-row { display: flex; justify-content: space-between; align-items: center; margin-top: 2px; }
.order-count { font-size: 0.63rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--accent-deep); }
.review-date { font-size: 0.63rem; color: var(--text-quarternary); }
.review-date--overdue { color: #B86B00; font-weight: 600; }

.mono-sm { font-family: var(--font-mono); font-size: 0.68rem; }

/* Empty */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 64px 32px; gap: 10px; text-align: center;
  border: 1px dashed var(--separator-2); border-radius: var(--r-lg);
  background: var(--surface);
}
.empty-icon { color: var(--text-placeholder); margin-bottom: 4px; }
.empty-title { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
.empty-sub { font-size: 0.82rem; color: var(--text-quarternary); max-width: 320px; line-height: 1.5; margin-bottom: 8px; }

/* Overlays */
.overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.28); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: flex-end;
}
.overlay--front { z-index: 1010; }
.overlay-enter-active, .overlay-leave-active { transition: opacity 180ms var(--ease); }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

/* Detail panel */
.detail-panel {
  width: 560px; max-width: 94vw; height: 100vh;
  background: var(--surface); display: flex; flex-direction: column;
  box-shadow: var(--shadow-xl);
}
.form-panel {
  width: 520px; max-width: 94vw; height: 100vh;
  background: var(--surface); display: flex; flex-direction: column;
  box-shadow: var(--shadow-xl);
}
.panel-enter-active { transition: transform 240ms var(--ease-spring); }
.panel-leave-active { transition: transform 180ms var(--ease); }
.panel-enter-from, .panel-leave-to { transform: translateX(100%); }
@media (max-width: 800px) {
  .overlay { align-items: flex-end; justify-content: stretch; }
  .detail-panel, .form-panel { width: 100%; max-width: 100%; height: auto; max-height: 92vh; border-radius: 20px 20px 0 0; }
  .panel-enter-from, .panel-leave-to { transform: translateY(100%); }
  .panel-enter-active { transition: transform 260ms var(--ease-spring); }
  .panel-leave-active { transition: transform 200ms var(--ease); }
}

.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px 14px; border-bottom: 1px solid var(--separator-2); flex-shrink: 0;
  gap: 12px;
}
.panel-header-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.panel-avatar {
  width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; color: #fff;
}
.panel-name { font-size: 1rem; font-weight: 700; letter-spacing: -0.03em; color: var(--text-primary); line-height: 1.2; }
.panel-company { font-size: 0.72rem; color: var(--text-quarternary); margin-top: 1px; }
.panel-title { font-size: 1.05rem; font-weight: 700; letter-spacing: -0.03em; color: var(--text-primary); }

.panel-header-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.panel-close {
  width: 28px; height: 28px; border-radius: var(--r-sm); margin-left: 2px;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-quarternary); transition: background var(--t-fast), color var(--t-fast);
}
.panel-close:hover { background: var(--surface-3); color: var(--text-primary); }

/* Tabs */
.panel-tabs {
  display: flex; border-bottom: 1px solid var(--separator-2);
  padding: 0 20px; flex-shrink: 0;
}
.panel-tab {
  padding: 10px 14px; font-size: 0.82rem; font-weight: 500;
  color: var(--text-quarternary); border-bottom: 2px solid transparent;
  margin-bottom: -1px; display: inline-flex; align-items: center; gap: 6px;
  transition: color var(--t-fast), border-color var(--t-fast);
}
.panel-tab:hover { color: var(--text-primary); }
.panel-tab--active { color: var(--text-primary); border-bottom-color: var(--accent); font-weight: 600; }
.tab-count {
  font-size: 0.60rem; font-weight: 700; padding: 1px 5px; border-radius: 99px;
  background: var(--surface-3); color: var(--text-quarternary);
}

.panel-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.panel-footer {
  padding: 16px 24px; border-top: 1px solid var(--separator-2);
  display: flex; gap: 10px; justify-content: flex-end; flex-shrink: 0;
}

/* Detail sections */
.detail-section { display: flex; flex-direction: column; gap: 8px; }
.detail-section-label {
  font-size: 0.63rem; font-weight: 700; letter-spacing: 0.07em;
  text-transform: uppercase; color: var(--text-placeholder);
  padding-bottom: 6px; border-bottom: 1px solid var(--separator-2);
}
.detail-grid { display: flex; flex-direction: column; gap: 6px; }
.detail-row {
  display: flex; align-items: baseline; gap: 12px;
  font-size: 0.83rem;
}
.detail-key { color: var(--text-quarternary); min-width: 150px; flex-shrink: 0; font-size: 0.78rem; }
.detail-val { color: var(--text-primary); font-weight: 500; display: flex; align-items: center; gap: 6px; }
.detail-link { color: var(--accent-deep); text-decoration: none; }
.detail-link:hover { text-decoration: underline; }
.text-red { color: var(--red); }
.overdue-chip {
  font-size: 0.58rem; font-weight: 700; padding: 1px 5px; border-radius: 99px;
  background: rgba(229,57,53,0.10); color: var(--red); text-transform: uppercase; letter-spacing: 0.04em;
}
.address-block {
  font-size: 0.85rem; color: var(--text-primary); line-height: 1.7;
  padding: 10px 12px; background: var(--surface-2); border-radius: var(--r-sm);
  border: 1px solid var(--separator-2);
}
.notes-text { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; white-space: pre-wrap; }

/* DD tab */
.dd-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.dd-intro { font-size: 0.78rem; color: var(--text-quarternary); line-height: 1.5; flex: 1; }
.btn-dd-add {
  display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0;
  font-size: 0.75rem; font-weight: 600; padding: 7px 12px; border-radius: var(--r-sm);
  background: linear-gradient(145deg, #4CD97B, #28A852); color: #fff;
  box-shadow: 0 1px 5px rgba(40,168,82,0.2);
}

.dd-form {
  background: var(--surface-2); border: 1px solid var(--separator-2);
  border-radius: var(--r-lg); padding: 16px;
  display: flex; flex-direction: column; gap: 10px;
}
.dd-form-title { font-size: 0.78rem; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
.dd-form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }

.toggle-row { display: flex; gap: 6px; }
.toggle-btn {
  padding: 6px 14px; border-radius: var(--r-sm);
  border: 1px solid var(--separator-2); background: var(--surface);
  font-size: 0.80rem; font-weight: 500; color: var(--text-secondary);
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
}
.toggle-btn--on { background: var(--accent); color: #fff; border-color: var(--accent); font-weight: 600; }

.dd-list { display: flex; flex-direction: column; gap: 0; border: 1px solid var(--separator-2); border-radius: var(--r-lg); overflow: hidden; }
.dd-entry {
  padding: 12px 14px; border-bottom: 1px solid var(--separator-2);
  display: flex; flex-direction: column; gap: 5px;
}
.dd-entry:last-child { border-bottom: none; }
.dd-entry-top { display: flex; align-items: center; gap: 8px; }
.dd-entry-date { font-size: 0.75rem; font-weight: 600; color: var(--text-primary); }
.dd-chips { display: flex; flex-wrap: wrap; gap: 4px; flex: 1; }
.dd-chip {
  font-size: 0.60rem; font-weight: 700; padding: 2px 7px; border-radius: 99px;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.dd-chip--ok   { background: rgba(76,217,123,0.10); color: #1A6B38; }
.dd-chip--fail { background: rgba(229,57,53,0.08); color: var(--red); }
.dd-delete {
  width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-placeholder); transition: background var(--t-fast), color var(--t-fast);
}
.dd-delete:hover { background: rgba(229,57,53,0.08); color: var(--red); }
.dd-method { font-size: 0.72rem; color: var(--text-quarternary); }
.dd-notes { font-size: 0.80rem; color: var(--text-secondary); line-height: 1.5; }
.dd-review { font-size: 0.70rem; color: var(--accent-deep); font-weight: 600; }

.dd-empty { font-size: 0.82rem; color: var(--text-quarternary); text-align: center; padding: 32px 0; }

/* Form fields */
.field-group-label {
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.07em;
  text-transform: uppercase; color: var(--text-placeholder);
  border-top: 1px solid var(--separator-2); padding-top: 8px;
}
.field-group-label:first-child { border-top: none; padding-top: 0; }

.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.field-row--3 { grid-template-columns: 1fr 1fr 1fr; }

.field { display: flex; flex-direction: column; gap: 5px; }
.field-label {
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.02em;
  text-transform: uppercase; color: var(--text-quarternary);
}
.label-opt { font-weight: 400; text-transform: none; letter-spacing: 0; }
.req { color: var(--red); }
.field-hint { font-size: 0.65rem; color: var(--text-placeholder); line-height: 1.4; }

.field-input {
  padding: 9px 12px; border-radius: var(--r-sm);
  border: 1px solid var(--separator-2); background: var(--surface-2);
  font-size: 0.88rem; color: var(--text-primary); width: 100%;
  transition: border-color var(--t-fast);
}
.field-input:focus { outline: none; border-color: var(--accent); background: var(--surface); }
.field-textarea { resize: vertical; min-height: 72px; line-height: 1.5; }

.form-error {
  font-size: 0.78rem; color: var(--red); padding: 8px 12px;
  background: rgba(229,57,53,0.07); border-radius: var(--r-sm);
  border: 1px solid rgba(229,57,53,0.2);
}

/* Customer type selector */
.type-selector { display: flex; gap: 6px; }
.type-opt {
  flex: 1; padding: 8px 10px; border-radius: var(--r-sm); font-size: 0.80rem;
  border: 1px solid var(--separator-2); background: var(--surface-2);
  color: var(--text-secondary); font-weight: 500; text-align: center;
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
}
.type-opt--active { background: var(--accent); color: #fff; border-color: var(--accent); font-weight: 600; }

.btn-submit {
  padding: 9px 20px; border-radius: var(--r-sm);
  background: linear-gradient(145deg, #4CD97B, #28A852); color: #fff;
  font-size: 0.85rem; font-weight: 600;
  box-shadow: 0 1px 6px rgba(40,168,82,0.25);
  transition: box-shadow var(--t-fast), opacity var(--t-fast), transform var(--t-fast) var(--ease-spring);
}
.btn-submit:hover:not(:disabled) { box-shadow: 0 3px 10px rgba(40,168,82,0.35); transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-cancel {
  padding: 9px 16px; border-radius: var(--r-sm);
  border: 1px solid var(--separator-2); background: var(--surface-2);
  font-size: 0.85rem; font-weight: 500; color: var(--text-secondary);
  transition: background var(--t-fast);
}
.btn-cancel:hover { background: var(--surface-3); }

/* Confirm dialog */
.confirm-dialog {
  background: var(--surface); border-radius: var(--r-lg);
  padding: 28px 24px; width: 380px; max-width: 92vw;
  box-shadow: var(--shadow-xl); margin: auto;
  display: flex; flex-direction: column; gap: 10px;
}
.confirm-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
}
.confirm-icon--red { background: rgba(229,57,53,0.10); color: var(--red); }
.confirm-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
.confirm-sub { font-size: 0.83rem; color: var(--text-quarternary); line-height: 1.5; }
.confirm-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }

.btn-delete {
  padding: 9px 16px; border-radius: var(--r-sm);
  background: var(--red); color: #fff; font-size: 0.85rem; font-weight: 600;
  box-shadow: 0 1px 6px rgba(229,57,53,0.25);
  transition: box-shadow var(--t-fast), opacity var(--t-fast);
}
.btn-delete:hover:not(:disabled) { box-shadow: 0 3px 9px rgba(229,57,53,0.35); }
.btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
