using System.Collections.Generic;
using System.Linq;

namespace CalculateFunding.Frontend.ViewModels.Paging
{
    public class PagerState
    {
        private int _currentPage;
        private int _totalPages;
        private int? _nextPage;
        private int? _previousPage;
        private int _displayNumberOfPages;

        public int DisplayNumberOfPages
        {
            get
            {
                return _displayNumberOfPages;
            }
        }

        public PagerState(int currentPage, int totalPages, int displayNumberOfPages = 4)
        {
            _currentPage = currentPage;
            _totalPages = totalPages;
            _displayNumberOfPages = displayNumberOfPages;

            CalculatePages();
        }

        private void CalculatePages()
        {
            List<int> pages = new List<int>();

            int numberOfAdditionalPages = _totalPages - _currentPage;
            int availableDisplayPages = _displayNumberOfPages;
            if (_totalPages < _displayNumberOfPages)
            {
                availableDisplayPages = availableDisplayPages = _totalPages;
            }
            

            if (numberOfAdditionalPages > _displayNumberOfPages)
            {
                numberOfAdditionalPages = _displayNumberOfPages;
            }

            int previousPages = availableDisplayPages - 1 - numberOfAdditionalPages;
            if(previousPages < 0)
            {
                if(_currentPage == 1)
                {
                    previousPages = 0;
                }
                else if(previousPages == -1)
                {
                    previousPages = 1;
                }
            }

            if (_currentPage + numberOfAdditionalPages == _totalPages && previousPages == 0)
            {
                numberOfAdditionalPages = numberOfAdditionalPages - 1;
                if (_currentPage > 1)
                {
                    previousPages = 1;
                }
            }

            if (numberOfAdditionalPages < _displayNumberOfPages)
            {
                for (int i = _currentPage - previousPages; i < _currentPage; i++)
                {
                    pages.Add(i);
                }
            }
            else
            {
                if (_currentPage != 1)
                {
                    pages.Add(_currentPage - 1);
                }
            }

            pages.Add(_currentPage);

            for (int i = _currentPage; i < _totalPages; i++)
            {
                pages.Add(i + 1);

                if (_currentPage == _totalPages)
                {
                    break;
                }

                if (pages.Count == _displayNumberOfPages)
                {
                    break;
                }
            }

            if (numberOfAdditionalPages + _currentPage <= _totalPages)
            {
                int nextPageValue = pages.Last() + 1; ;
                if (nextPageValue <= _totalPages)
                {
                    _nextPage = nextPageValue;

                }
            }

            if (previousPages > 0)
            {
                int previousPageValue = _currentPage - previousPages - 1;
                if(previousPageValue > 0)
                {
                    _previousPage = previousPageValue;
                }
            }

            this.Pages = pages.AsEnumerable();
        }

        public int? PreviousPage
        {
            get
            {
                return _previousPage;
            }
        }

        public int? NextPage
        {
            get
            {
                return _nextPage;
            }
        }

        public IEnumerable<int> Pages { get; set; }

        public int CurrentPage
        {
            get
            {
                return _currentPage;
            }
        }
    }
}
