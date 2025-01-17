import { sendMB } from '@/infrastructure/event-tracking'
import { getSplitTestVariant } from '@/utils/splitTestUtils'
import getMeta from '@/utils/meta'

export function sendPlansViewEvent() {
  document.addEventListener(
    'DOMContentLoaded',
    function () {
      const currency = getMeta('ol-recommendedCurrency')
      const countryCode = getMeta('ol-countryCode')
      const geoPricingLATAMTestVariant = getSplitTestVariant(
        'geo-pricing-latam-v2'
      )

      const groupTabImprovementsVariant = getSplitTestVariant(
        'group-tab-improvements'
      )

      const websiteRedesignPlansTestVariant = getMeta(
        'ol-websiteRedesignPlansVariant'
      )

      const device = window.matchMedia('(max-width: 767px)').matches
        ? 'mobile'
        : 'desktop'

      const queryParams = new URLSearchParams(window.location.search)
      const planTabParam = queryParams.get('plan')

      const plansPageViewSegmentation = {
        currency,
        countryCode,
        device,
        'geo-pricing-latam-v2': geoPricingLATAMTestVariant,
        'website-redesign-plans': websiteRedesignPlansTestVariant,
        'group-tab-improvements': groupTabImprovementsVariant,
        plan: planTabParam,
      }

      const isPlansPage = window.location.href.includes(
        'user/subscription/plans'
      )
      const isInterstitialPaymentPage = window.location.href.includes(
        'user/subscription/choose-your-plan'
      )

      if (isPlansPage) {
        sendMB('plans-page-view', plansPageViewSegmentation)
      } else if (isInterstitialPaymentPage) {
        sendMB('paywall-plans-page-view', plansPageViewSegmentation)
      }
    },
    { once: true }
  )
}
