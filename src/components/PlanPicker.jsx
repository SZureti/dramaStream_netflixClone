import { PLANS } from '../data/plans.js';

/** Netflix-style plan cards as radio buttons. Every plan is free in this demo. */
export default function PlanPicker({ value, onChange, legend = 'Choose the plan that’s right for you' }) {
  return (
    <fieldset className="plans">
      <legend className="plans__legend">{legend}</legend>
      <div className="plans__grid">
        {PLANS.map((p) => (
          <label key={p.id} className={`plan${value === p.id ? ' plan--on' : ''}`}>
            <input type="radio" name="plan" value={p.id} checked={value === p.id} onChange={() => onChange(p.id)} />
            <span className="plan__name">{p.name}</span>
            <span className="plan__res">{p.resolution}</span>
            <dl className="plan__facts">
              <div>
                <dt>Price</dt>
                <dd>{p.price}</dd>
              </div>
              <div>
                <dt>Video quality</dt>
                <dd>{p.quality}</dd>
              </div>
              <div>
                <dt>Screens at once</dt>
                <dd>{p.screens}</dd>
              </div>
            </dl>
          </label>
        ))}
      </div>
      <p className="field-hint">This is a demo: plans are free and no payment details are collected.</p>
    </fieldset>
  );
}
