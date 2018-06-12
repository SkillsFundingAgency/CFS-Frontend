namespace CalculateFunding.Frontend.ViewModels.TestEngine
{
    public class ResultCountsViewModel
    {
        public int Passed { get; set; }

        public int Failed { get; set; }

        public int Ignored { get; set; }

        public decimal TestCoverage { get; set; }
    }
}
