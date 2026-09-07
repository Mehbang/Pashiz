import { ItemFormBasicSection } from './ItemFormBasicSection';
import { ItemFormCategoryFieldsSection } from './ItemFormCategoryFieldsSection';
import { ItemFormInventorySection } from './ItemFormInventorySection';
import { ItemFormPurchasingSection } from './ItemFormPurchasingSection';
import { ItemFormSectionDivider } from './ItemFormSectionDivider';
import { ItemFormSellingSection } from './ItemFormSellingSection';
import { Box } from '@/components';

export function ItemFormSections() {
  return (
    <Box>
      <ItemFormBasicSection />
      <ItemFormSectionDivider />

      <ItemFormSellingSection />
      <ItemFormSectionDivider />

      <ItemFormPurchasingSection />
      <ItemFormSectionDivider />

      <ItemFormInventorySection />

      {/* Carries its own divider: the section vanishes when the chosen
          category defines no fields, and the rule has to vanish with it. */}
      <ItemFormCategoryFieldsSection />
    </Box>
  );
}
