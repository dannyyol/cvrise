import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface PaymentNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'processing' | 'success' | 'error' | 'canceled' | null;
}

export const PaymentNotificationModal: React.FC<PaymentNotificationModalProps> = ({
  isOpen,
  onClose,
  status,
}) => {
  if (!status) return null;

  const content = {
    processing: {
      icon: <AlertCircle className="w-16 h-16 text-blue-500 mb-4" />,
      title: 'Confirming Payment...',
      message: 'This may take a few seconds. Please keep this page open while we confirm your payment.',
      buttonText: 'Close',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
    success: {
      icon: <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />,
      title: 'Payment Successful!',
      message: 'Thank you for your purchase. Your tokens have been added to your account.',
      buttonText: 'Continue',
      buttonColor: 'bg-green-600 hover:bg-green-700',
    },
    error: {
      icon: <XCircle className="w-16 h-16 text-red-500 mb-4" />,
      title: 'Payment Failed',
      message: 'Something went wrong with your transaction. Please try again.',
      buttonText: 'Try Again',
      buttonColor: 'bg-red-600 hover:bg-red-700',
    },
    canceled: {
      icon: <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />,
      title: 'Payment Canceled',
      message: 'You have canceled the payment process. No charges were made.',
      buttonText: 'Close',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    },
  };

  const current = content[status];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="sm"
    >
      <div className="flex flex-col items-center text-center pt-2 pb-6">
        <div className="rounded-full bg-gray-50 p-4 mb-4 animate-in zoom-in duration-300">
          {current.icon}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {current.title}
        </h2>
        
        <p className="text-gray-500 mb-8 max-w-[280px]">
          {current.message}
        </p>

        <Button
          onClick={onClose}
          className={`w-full ${current.buttonColor} text-white`}
        >
          {current.buttonText}
          {status === 'success' && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </Modal>
  );
};
