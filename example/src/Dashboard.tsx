import React from 'react';
import type { useCriiptoVerify } from '@criipto/verify-react';
import './App.css';

type Claims = NonNullable<ReturnType<typeof useCriiptoVerify>['claims']>;

interface DashboardProps {
  user: Claims;
}

function Dashboard({ user: { name, birthdate, country, cprNumberIdentifier } }: DashboardProps) {
  const firstName = name != null ? String(name).split(' ')[0] : name;

  return (
    <div className="user-dashboard main">
      <h1 className="greeting">Hi, {firstName}</h1>

      <div className="dashboard-items">
        <div className="dashboard-card data-card">
          <h3>Your data</h3>
          <ul className="user-data">
            <li>
              <span className="fixed-width">Name</span>
              <span className="data-name">{name}</span>
            </li>
            {birthdate && (
              <li>
                <span className="fixed-width">Birthdate</span>
                <span className="data-name">{birthdate}</span>
              </li>
            )}
            {cprNumberIdentifier && (
              <li>
                <span className="fixed-width">SSN</span>
                <span className="data-name">{cprNumberIdentifier}</span>
              </li>
            )}
            {country && (
              <li>
                <span className="fixed-width">Country</span>
                <span className="data-name">{country}</span>
              </li>
            )}
          </ul>
        </div>

        <div className="dashboard-card pension-card">
          <h3>Pension savings</h3>
          <span className="pension-amount">1.000.000 DKK</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
