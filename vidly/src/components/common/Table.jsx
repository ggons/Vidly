import React from 'react';
import TableHeader from './TableHeader';
import TableBody from './TableBody';

const Table = ({ columns, sortColumn, onSort, data }) => {
  return (  
    <table className="table">
      <TableHeader
        sortColumn={sortColumn}
        columns={columns}
        onSort={onSort}
      />
      <TableBody 
        data={data}
        columns={columns}
      />
    </table>
  );
}
 
export default Table;