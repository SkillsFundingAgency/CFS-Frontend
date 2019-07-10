using System.Collections.Generic;
using PolicyModels = CalculateFunding.Common.ApiClient.Policies.Models;

namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    public class FundingStreamComparer : IEqualityComparer<PolicyModels.FundingStream>
    {
        public bool Equals(PolicyModels.FundingStream x, PolicyModels.FundingStream y)
        {
            if (y == null && x == null)
            {
                return true;
            }
            else if (x == null || y == null)
            {
                return false;
            }
            else if (x.Id == y.Id)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        public int GetHashCode(PolicyModels.FundingStream obj)
        {
            return obj.Id.GetHashCode();
        }
    }
}
