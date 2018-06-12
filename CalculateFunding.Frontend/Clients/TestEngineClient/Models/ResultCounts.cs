using System;

namespace CalculateFunding.Frontend.Clients.TestEngineClient.Models
{
    public class ResultCounts
    {
        public int Passed { get; set; }

        public int Failed { get; set; }

        public int Ignored { get; set; }

        public decimal TestCoverage
        {
            get
            {
                int totalRecords = Passed + Failed + Ignored;
                if (totalRecords == 0)
                {
                    return 0;
                }

                return Math.Round((decimal)(Passed + Failed) / totalRecords * 100, 1);
            }
        }
    }
}
