import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CountryCombobox from '../../components/CountryCombobox.jsx'

function setup(props = {}) {
  const onChange = props.onChange ?? vi.fn()
  const user = userEvent.setup()
  const utils = render(
    <CountryCombobox value={props.value ?? ''} onChange={onChange} lang={props.lang ?? 'fr'} error={props.error ?? false} />,
  )
  return { ...utils, onChange, user }
}

describe('CountryCombobox', () => {
  describe('initial state (closed)', () => {
    it('shows the French placeholder when no country is selected', () => {
      setup()
      expect(screen.getByPlaceholderText(/choisir un pays/i)).toBeInTheDocument()
    })

    it('shows the English placeholder when lang="en"', () => {
      setup({ lang: 'en' })
      expect(screen.getByPlaceholderText(/select a country/i)).toBeInTheDocument()
    })

    it('shows the selected country name when a value is provided', () => {
      const { getByDisplayValue } = setup({ value: 'BE' })
      // Input displays the country name when closed
      expect(getByDisplayValue('Belgique')).toBeInTheDocument()
    })

    it('shows a flag emoji when a country is selected', () => {
      setup({ value: 'BE' })
      expect(screen.getByText('🇧🇪')).toBeInTheDocument()
    })

    it('applies red border when error prop is true', () => {
      setup({ error: true })
      const input = screen.getByRole('combobox')
      expect(input).toHaveStyle({ borderColor: '#E24B4A' })
    })
  })

  describe('opening the dropdown', () => {
    it('opens the listbox when the input is clicked', async () => {
      const { user } = setup()
      await user.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('opens the listbox when the input receives focus', async () => {
      const { user } = setup()
      await user.tab() // Tab into the input
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('shows all countries when no query is typed', async () => {
      const { user } = setup()
      await user.click(screen.getByRole('combobox'))
      const options = screen.getAllByRole('option')
      expect(options.length).toBeGreaterThanOrEqual(40)
    })
  })

  describe('search filtering', () => {
    it('filters countries by French name', async () => {
      const { user } = setup({ lang: 'fr' })
      await user.click(screen.getByRole('combobox'))
      await user.type(screen.getByRole('combobox'), 'belg')
      const options = screen.getAllByRole('option')
      // Should show Belgique (and possibly Deutschland / Deutschland doesn't match 'belg')
      expect(options.some(o => o.textContent?.includes('Belgique'))).toBe(true)
    })

    it('filters countries by ISO code', async () => {
      const { user } = setup({ lang: 'fr' })
      await user.click(screen.getByRole('combobox'))
      await user.type(screen.getByRole('combobox'), 'FR')
      const options = screen.getAllByRole('option')
      expect(options.some(o => o.textContent?.includes('France'))).toBe(true)
    })

    it('shows "Aucun résultat" when query matches nothing', async () => {
      const { user } = setup({ lang: 'fr' })
      await user.click(screen.getByRole('combobox'))
      await user.type(screen.getByRole('combobox'), 'xqzxqzxqz')
      expect(screen.getByText(/aucun résultat/i)).toBeInTheDocument()
    })

    it('shows "No results" in English when query matches nothing', async () => {
      const { user } = setup({ lang: 'en' })
      await user.click(screen.getByRole('combobox'))
      await user.type(screen.getByRole('combobox'), 'xqzxqzxqz')
      expect(screen.getByText(/no results/i)).toBeInTheDocument()
    })
  })

  describe('selecting a country', () => {
    it('calls onChange with the ISO code when an option is clicked', async () => {
      const { user, onChange } = setup()
      await user.click(screen.getByRole('combobox'))
      const belgique = screen.getAllByRole('option').find(o => o.textContent?.includes('Belgique'))
      await user.click(belgique)
      expect(onChange).toHaveBeenCalledWith('BE')
    })

    it('closes the dropdown after selection', async () => {
      const { user } = setup()
      await user.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      const belgique = screen.getAllByRole('option').find(o => o.textContent?.includes('Belgique'))
      await user.click(belgique)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('marks the selected country with aria-selected="true"', async () => {
      const { user } = setup({ value: 'BE' })
      await user.click(screen.getByRole('combobox'))
      const selected = screen.getAllByRole('option').find(o => o.getAttribute('aria-selected') === 'true')
      expect(selected).toBeTruthy()
      expect(selected.textContent).toContain('Belgique')
    })

    it('shows a checkmark next to the selected country', async () => {
      const { user } = setup({ value: 'FR' })
      await user.click(screen.getByRole('combobox'))
      // The FR option should have a ✓ span
      const frOption = screen.getAllByRole('option').find(o => o.textContent?.includes('France'))
      expect(frOption.textContent).toContain('✓')
    })
  })

  describe('keyboard navigation', () => {
    it('opens the list when ArrowDown is pressed', async () => {
      const { user } = setup()
      const input = screen.getByRole('combobox')
      await user.click(input)
      // Close it first
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      // Re-open with ArrowDown
      await user.keyboard('{ArrowDown}')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('closes the list when Escape is pressed', async () => {
      const { user } = setup()
      await user.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('navigates down through options with ArrowDown', async () => {
      const { user } = setup()
      await user.click(screen.getByRole('combobox'))
      const input = screen.getByRole('combobox')
      // Focus the first option
      await user.keyboard('{ArrowDown}')
      // The input's aria-activedescendant should be set
      expect(input.getAttribute('aria-activedescendant')).toBeTruthy()
    })

    it('selects the focused option on Enter', async () => {
      const { user, onChange } = setup()
      await user.click(screen.getByRole('combobox'))
      // Navigate to the first option (index 0 = Belgique)
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')
      expect(onChange).toHaveBeenCalledWith('BE')
    })
  })

  describe('accessibility', () => {
    it('the input has role="combobox"', () => {
      setup()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('has aria-expanded=false when closed', () => {
      setup()
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
    })

    it('has aria-expanded=true when open', async () => {
      const { user } = setup()
      await user.click(screen.getByRole('combobox'))
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true')
    })

    it('the listbox has an accessible label', async () => {
      const { user } = setup({ lang: 'fr' })
      await user.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox', { name: /pays/i })).toBeInTheDocument()
    })
  })
})
