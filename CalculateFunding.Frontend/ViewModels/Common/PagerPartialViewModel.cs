namespace CalculateFunding.Frontend.ViewModels.Common
{
    using CalculateFunding.Common.Utility;

    public class PagerPartialViewModel
    {
        private PagerState _pagerState;
        private string _entityName;
        private string _searchTerm;
        private int _totalResults;
        private int _startItemNumber;
        private int _endItemNumber;

        /// <summary>
        /// Initializes a new instance of the <see cref="PagerPartialViewModel"/> class.
        /// </summary>
        /// <param name="searchResult">Search Result</param>
        /// <param name="entityName">Entity name</param>
        /// <param name="searchTerm">Current Search Term</param>
        public PagerPartialViewModel(SearchResultViewModel searchResult, string entityName, string searchTerm)
        {
            Guard.ArgumentNotNull(searchResult, nameof(searchResult));
            Guard.IsNullOrWhiteSpace(entityName, nameof(entityName));

            _pagerState = searchResult.PagerState;
            _entityName = entityName;
            _searchTerm = searchTerm;
            _totalResults = searchResult.TotalResults;
            _startItemNumber = searchResult.StartItemNumber;
            _endItemNumber = searchResult.EndItemNumber;
        }

        public PagerState PagerState
        {
            get
            {
                return _pagerState;
            }
        }

        public string EntityName
        {
            get
            {
                return _entityName;
            }
        }

        public string SearchTerm
        {
            get
            {
                return _searchTerm;
            }
        }

        public int TotalResults
        {
            get
            {
                return _totalResults;
            }
        }

        public int StartItemNumber
        {
            get
            {
                return _startItemNumber;
            }
        }

        public int EndItemNumber
        {
            get
            {
                return _endItemNumber;
            }
        }
    }
}
