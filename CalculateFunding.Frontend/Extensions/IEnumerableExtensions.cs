namespace System.Linq
{
    using System.Collections.Generic;
    using System.ComponentModel;
    using CalculateFunding.Common.TemplateMetadata.Models;

    [EditorBrowsable(EditorBrowsableState.Never)]
    public static class IEnumerableExtensions
    {
        public static bool AnyWithNullCheck<T>(this IEnumerable<T> enumerable)
        {
            if (enumerable == null)
            {
                return false;
            }

            return enumerable.Any();
        }

        public static bool IsNullOrEmpty<T>(this IEnumerable<T> enumerable)
        {
            return !enumerable.AnyWithNullCheck();
        }

        public static T[] ToArraySafe<T>(this IEnumerable<T> enumerable)
        {
            return (enumerable ?? Enumerable.Empty<T>()).ToArray();
        }

        public static bool EqualTo<T>(this IEnumerable<T> enumerable, IEnumerable<T> other)
        {
            return enumerable.OrderBy(m => m).SequenceEqual(other.OrderBy(m => m));
        }

        public static IEnumerable<IEnumerable<TSource>> Partition<TSource>(this IEnumerable<TSource> source, int size)
        {
            var batch = new List<TSource>();
            foreach (var item in source)
            {
                batch.Add(item);
                if (batch.Count != size)
                {
                    continue;
                }

                yield return batch;
                batch = new List<TSource>();
            }

            if (batch.Any())
            {
                yield return batch;
            }
        }

        public static bool ContainsDuplicates<T>(this IEnumerable<T> enumerable)
        {
            if (enumerable.IsNullOrEmpty())
            {
                return false;
            }

            var knownKeys = new HashSet<T>();

            return enumerable.Any(item => !knownKeys.Add(item));
        }

        public static IEnumerable<T> Flatten<T>(this IEnumerable<T> enumerable, Func<T, IEnumerable<T>> func)
        {
            enumerable = enumerable ?? new T[0];

            return enumerable.SelectMany(c => func(c).Flatten(func)).Concat(enumerable);
        }

        public static IEnumerable<Calculation> FlattenDepthFirst(this IEnumerable<Calculation> enumerable)
        {
            List<Calculation> results = new List<Calculation>();

            if (enumerable.AnyWithNullCheck())
            {
                foreach (Calculation item in enumerable)
                {
                    results.Add(item);

                    if (item.Calculations.AnyWithNullCheck())
                    {
                        results.AddRange(FlattenDepthFirst(item.Calculations));
                    }
                }
            }

            return results;
        }

        public static IEnumerable<TSource> DistinctBy<TSource, TKey>(this IEnumerable<TSource> source, Func<TSource, TKey> keySelector)
        {
            var keys = new HashSet<TKey>();
            foreach (TSource element in source)
            {
                if (keys.Add(keySelector(element)))
                {
                    yield return element;
                }
            }
        }

        public static TValue GetValueOrDefault<TKey, TValue>(this IDictionary<TKey, TValue> source, TKey key)
        {
            if (source != null && source.ContainsKey(key))
            {
                return source[key];
            }

            return default(TValue);
        }


    }
}
