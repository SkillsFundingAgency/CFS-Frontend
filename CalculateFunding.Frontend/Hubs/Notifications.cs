using System.Threading.Tasks;
using CalculateFunding.Common.Utility;
using Microsoft.AspNetCore.SignalR;

namespace CalculateFunding.Frontend.Hubs
{
    public class Notifications : Hub
    {
        public async Task StartWatchingForAllNotifications()
        {
            string groupName = "notifications";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task StopWatchingForAllNotifications()
        {
            string groupName = "notifications";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task StartWatchingForSpecificationNotifications(string specificationId)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));

            string groupName = $"spec{specificationId.Replace("-", "")}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task StopWatchingForSpecificationNotifications(string specificationId)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));

            string groupName = $"spec-{specificationId}";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }
    }
}
