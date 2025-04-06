import React from 'react';
import { useForm } from 'react-hook-form';

const ShippingForm = ({ onSubmit, shippingInfo }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: shippingInfo
  });

  return (
    <div className="shipping-form">
      <h2>Shipping Information</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            placeholder="Email"
            className="form-control"
          />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              {...register('firstName', { required: 'First name is required' })}
              placeholder="First Name"
              className="form-control"
            />
            {errors.firstName && <span className="error">{errors.firstName.message}</span>}
          </div>
          <div className="form-group">
            <input
              type="text"
              {...register('lastName', { required: 'Last name is required' })}
              placeholder="Last Name"
              className="form-control"
            />
            {errors.lastName && <span className="error">{errors.lastName.message}</span>}
          </div>
        </div>

        <div className="form-group">
          <select {...register('country', { required: 'Country is required' })} className="form-control">
            <option value="">Select Country</option>
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="CA">Canada</option>
          </select>
          {errors.country && <span className="error">{errors.country.message}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              {...register('city', { required: 'City is required' })}
              placeholder="City"
              className="form-control"
            />
            {errors.city && <span className="error">{errors.city.message}</span>}
          </div>
          <div className="form-group">
            <input
              type="text"
              {...register('postalCode', { required: 'Postal code is required' })}
              placeholder="Postal Code"
              className="form-control"
            />
            {errors.postalCode && <span className="error">{errors.postalCode.message}</span>}
          </div>
        </div>

        <div className="form-group">
          <select {...register('courier', { required: 'Courier is required' })} className="form-control">
            <option value="">Select Courier</option>
            <option value="fedex">FedEx</option>
            <option value="ups">UPS</option>
            <option value="usps">USPS</option>
          </select>
          {errors.courier && <span className="error">{errors.courier.message}</span>}
        </div>
      </form>
    </div>
  );
};

export default ShippingForm;