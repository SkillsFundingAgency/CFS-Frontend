using CalculateFunding.Common.ApiClient.Models;

namespace CalculateFunding.Frontend.Helpers
{
    public static class UserProfileExtensions
    {
        public static string AsUserName(this UserProfile userProfile)
        {
            return $"{userProfile.Firstname} {userProfile.Lastname}";
        }
    }
}
