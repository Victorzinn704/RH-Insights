import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeFormModal } from '../EmployeeFormModal';

describe('EmployeeFormModal', () => {
  const defaultProps = {
    isOpen: true,
    editingEmployee: null,
    isDarkMode: false,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    render(<EmployeeFormModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Novo Funcionário')).not.toBeInTheDocument();
  });

  it('renders form title when open', () => {
    render(<EmployeeFormModal {...defaultProps} />);
    expect(screen.getByText('Novo Funcionário')).toBeInTheDocument();
  });

  it('renders all form inputs by name attribute', () => {
    render(<EmployeeFormModal {...defaultProps} />);
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();

    const nameInput = form?.querySelector('input[name="name"]');
    const positionInput = form?.querySelector('input[name="position"]');
    const salaryInput = form?.querySelector('input[name="salary"]');

    expect(nameInput).toBeInTheDocument();
    expect(positionInput).toBeInTheDocument();
    expect(salaryInput).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', async () => {
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());

    render(<EmployeeFormModal {...defaultProps} onSubmit={handleSubmit} />);

    const form = document.querySelector('form') as HTMLFormElement;
    expect(form).toBeInTheDocument();

    // Dispatch submit event directly (bypasses browser validation in jsdom)
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(handleSubmit).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(<EmployeeFormModal {...defaultProps} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: '' });
    await user.click(closeBtn);

    expect(handleClose).toHaveBeenCalled();
  });
});
