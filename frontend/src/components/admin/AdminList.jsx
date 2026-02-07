import React from 'react';
import { Mail, Building, Shield, Trash2 } from 'lucide-react';
import Button from '../shared/Button';

const AdminList = ({ admins, onDelete }) => {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Admin
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              University
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {admins.map((admin) => (
            <tr key={admin._id} className="hover:bg-gray-800 transition">
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {admin.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{admin.name}</div>
                    <div className="text-gray-400 text-sm">{admin.title}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Mail className="w-4 h-4" />
                  <span>{admin.email}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Building className="w-4 h-4" />
                  <span>{admin.university}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500 bg-opacity-20 text-green-400">
                  <Shield className="w-3 h-3 inline mr-1" />
                  {admin.role}
                </span>
              </td>
              <td className="px-6 py-4">
                <Button
                  onClick={() => onDelete(admin._id)}
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                >
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminList;
