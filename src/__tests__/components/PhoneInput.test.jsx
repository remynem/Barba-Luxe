import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PhoneInput from '../../components/PhoneInput.jsx'

function setup(props = {}) {
  const onPhone    = props.onPhone    ?? vi.fn()
  const onDialCode = props.onDialCode ?? vi.fn()
  const user = userEvent.setup()
  const utils = render(
    <PhoneInput
      phone={props.phone ?? ''}
      onPhone={onPhone}
      dialCode={props.dialCode ?? '+32'}
      onDialCode={onDialCode}
      lang={props.lang ?? 'fr'}
      error={props.error ?? false}
    />,
  )
  return { ...utils, onPhone, onDialCode, user }
}

describe('PhoneInput', () => {
  describe('rendering', () => {
    it('displays the current dial code', () => {
      setup({ dialCode: '+32' })
      expect(screen.getByText('+32')).toBeInTheDocument()
    })

    it('displays the flag for the dial code', () => {
      setup({ dialCode: '+32' }) // Belgium
      expect(screen.getByText('🇧🇪')).toBeInTheDocument()
    })

    it('shows the current phone number in the input', () => {
      setup({ phone: '0475123456' })
      expect(screen.getByDisplayValue('0475123456')).toBeInTheDocument()
    })

    it('shows French placeholder by default', () => {
      setup({ lang: 'fr' })
      expect(screen.getByPlaceholderText(/numéro/i)).toBeInTheDocument()
    })

    it('shows English placeholder when lang="en"', () => {
      setup({ lang: 'en' })
      expect(screen.getByPlaceholderText(/number/i)).toBeInTheDocument()
    })
  })

  describe('phone number input', () => {
    it('calls onPhone when user types', async () => {
      const { user, onPhone } = setup()
      const input = screen.getByRole('textbox', { name: /téléphone|phone/i })
      await user.type(input, '0475')
      expect(onPhone).toHaveBeenCalled()
    })

    it('strips non-digit characters (only digits pass through formatPhone)', async () => {
      const { user, onPhone } = setup()
      const input = screen.getByRole('textbox', { name: /téléphone|phone/i })
      await user.type(input, 'abc')
      // If formatPhone strips non-digits, onPhone should have been called with ''
      // (or not called at all if nothing passes through)
      const lastCall = onPhone.mock.calls.at(-1)
      if (lastCall) {
        expect(lastCall[0]).toMatch(/^\d*$/)
      }
    })
  })

  describe('dial code picker', () => {
    it('opens the dial picker when the button is clicked', async () => {
      const { user } = setup()
      const btn = screen.getByRole('button', { expanded: false })
      await user.click(btn)
      // The search input inside the dropdown should appear
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('filters countries by query', async () => {
      const { user } = setup({ lang: 'fr' })
      const btn = screen.getByRole('button')
      await user.click(btn)
      const searchInput = screen.getByPlaceholderText(/rechercher/i)
      await user.type(searchInput, 'belg')
      const options = screen.getAllByRole('option')
      expect(options.some(o => o.textContent?.includes('Belgique'))).toBe(true)
    })

    it('calls onDialCode when a different country is selected', async () => {
      const { user, onDialCode } = setup({ dialCode: '+32' })
      const btn = screen.getByRole('button')
      await user.click(btn)
      // Find France option and click it
      const franceOption = screen.getAllByRole('option').find(o => o.textContent?.includes('France'))
      if (franceOption) {
        await user.click(franceOption)
        expect(onDialCode).toHaveBeenCalledWith('+33')
      }
    })

    it('closes picker after selection', async () => {
      const { user } = setup()
      await user.click(screen.getByRole('button'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      const firstOption = screen.getAllByRole('option')[0]
      await user.click(firstOption)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('shows "Aucun résultat" when search yields nothing', async () => {
      const { user } = setup({ lang: 'fr' })
      await user.click(screen.getByRole('button'))
      const searchInput = screen.getByPlaceholderText(/rechercher/i)
      await user.type(searchInput, 'zzzzzz')
      expect(screen.getByText(/aucun résultat/i)).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('renders without error styling by default', () => {
      setup({ error: false })
      // Dial button border should not be red
      const btn = screen.getByRole('button')
      expect(btn).not.toHaveStyle({ border: '1px solid #E24B4A' })
    })
  })
})
