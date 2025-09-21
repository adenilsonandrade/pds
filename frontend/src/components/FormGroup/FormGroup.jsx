import React from 'react';
import './FormGroup.css';

function FormGroup({ label, name, type = 'text', value, onChange, required, options, ...props }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      {type === 'select' ? (
        <select id={name} name={name} value={value} onChange={onChange} {...props}>
          {options.map(option => (
            <option key={option.id} value={option.id}>{option.name}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea id={name} name={name} value={value} onChange={onChange} {...props}></textarea>
      ) : (
        <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} {...props} />
      )}
    </div>
  );
}

export default FormGroup;