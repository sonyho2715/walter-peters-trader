import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const Studies = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['studies'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.STUDIES);
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading studies...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Studies</h2>

      <div className="grid gap-6">
        {data?.data?.map((study: any) => (
          <div key={study.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{study.title}</h3>
                <p className="text-gray-600 mt-2">{study.description}</p>
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                  <span>Start: {new Date(study.start_date).toLocaleDateString()}</span>
                  {study.end_date && <span>End: {new Date(study.end_date).toLocaleDateString()}</span>}
                  <span>Capacity: {study.current_participants}/{study.max_participants}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                study.status === 'active' ? 'bg-green-100 text-green-800' :
                study.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {study.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Studies;
