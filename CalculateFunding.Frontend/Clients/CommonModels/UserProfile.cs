namespace CalculateFunding.Frontend.Clients.CommonModels
{
    public class UserProfile
    {
        public string Id { get; set; }

        public string Username { get; set; }

        public string Firstname { get; set; }

        public string Lastname { get; set; }

        public string Fullname
        {
            get
            {
                if(string.IsNullOrWhiteSpace(Firstname) || string.IsNullOrWhiteSpace(Lastname))
                {
                    return string.Empty;
                }

                return $"{Firstname} {Lastname}";
            }
        }
    }
}
