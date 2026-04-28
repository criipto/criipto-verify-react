import React from 'react';
import type { useCriiptoVerify } from '@criipto/verify-react';
import './App.css';

type Claims = NonNullable<ReturnType<typeof useCriiptoVerify>['claims']>;

interface DashboardProps {
  user: Claims;
}

function Dashboard({
  user: { name, birthdate, country, cprNumberIdentifier, iat },
}: DashboardProps) {
  return (
    <div className="user-dashboard main">
      <h2>Welcome to your savings dashboard, {name}</h2>
      <h4>You have 1.000.000 DKK in pension savings</h4>
      <ul className="dashboard-list">
        <li>
          <span>Name:</span> {name}
        </li>
        <li>
          <span>Birthdate:</span> {birthdate}
        </li>
        <li>
          <span>Country:</span> {country}
        </li>
        <li>
          <span>cprNumberIdentifier: </span>
          {cprNumberIdentifier}
        </li>
        <li>
          <span>iat:</span> {iat}
        </li>
      </ul>
    </div>
  );
}

export default Dashboard;
